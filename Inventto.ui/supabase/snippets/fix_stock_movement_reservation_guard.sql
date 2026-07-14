-- MOV-07 · RN086 — guard de saída passa a considerar reservas ativas de estoque.
-- O guard de saldo (RN055) validava contra o estoque bruto; agora saídas exigem
-- (estoque + delta) >= SUM(stock_reservations ativas) do item. finalize_order não
-- se auto-bloqueia: consome a própria reserva ('consumed') antes de chamar o motor,
-- na mesma transação — o guard só conta status='active'. Também adiciona FOR UPDATE
-- na leitura do estoque (serializa saídas concorrentes do mesmo item).
-- Depende de stock_reservations (PED-01). Rode no banco local.

CREATE OR REPLACE FUNCTION public.create_stock_movement(movement_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_org_id UUID;
  v_movement_id UUID;
  v_role public.app_role;

  v_item_data JSONB;
  v_product_id UUID;
  v_variant_id UUID;
  v_qty INTEGER;
  v_type public.movement_type;
  v_delta INTEGER;

  v_current_stock INTEGER;
  v_current_cost NUMERIC;
  v_input_cost NUMERIC;
  v_new_cost NUMERIC;
  v_total_value NUMERIC;
  v_registered_cost NUMERIC;
  v_reserved INTEGER;
BEGIN
  v_org_id := (movement_data->>'organization_id')::UUID;
  v_type := (movement_data->>'type')::public.movement_type;

  -- 1. Validação de Permissão
  SELECT role INTO v_role FROM public.organization_members
  WHERE profile_id = v_user_id AND organization_id = v_org_id;

  IF v_role IS NULL THEN RAISE EXCEPTION 'Acesso negado.'; END IF;

  -- Vendedores só podem registrar saídas
  IF v_role = 'sales' AND v_type <> 'withdrawal' THEN
    RAISE EXCEPTION 'Permissão negada: Vendedores só podem registrar saídas.';
  END IF;

  -- 2. Cria Header
  INSERT INTO public.movements (organization_id, user_id, type, reason, description, order_id, document_number, executed_at)
  VALUES (
    v_org_id,
    v_user_id,
    v_type,
    movement_data->>'reason',
    movement_data->>'description',
    (movement_data->>'order_id')::UUID,
    movement_data->>'document_number',
    COALESCE((movement_data->>'executed_at')::TIMESTAMPTZ, now())
  )
  RETURNING id INTO v_movement_id;

  -- 3. Processa Itens
  FOR v_item_data IN SELECT * FROM jsonb_array_elements(movement_data->'items')
  LOOP
    v_product_id := (v_item_data->>'product_id')::UUID;
    v_variant_id := (v_item_data->>'variant_id')::UUID;
    v_qty := (v_item_data->>'quantity')::INTEGER;
    v_input_cost := COALESCE((v_item_data->>'unit_cost')::NUMERIC, 0);

    IF v_qty IS NULL OR v_qty = 0 THEN CONTINUE; END IF;

    CASE v_type
      WHEN 'entry' THEN v_delta := ABS(v_qty);
      WHEN 'withdrawal' THEN v_delta := ABS(v_qty) * -1;
    END CASE;

    -- ============================================================
    -- LÓGICA DO CUSTO MÉDIO PONDERADO
    -- ============================================================

    -- A. Se for VARIANTE
    IF v_variant_id IS NOT NULL THEN
      SELECT stock, cost_price INTO v_current_stock, v_current_cost
      FROM public.product_variants WHERE id = v_variant_id FOR UPDATE;

      -- RN055: saldo não pode ficar negativo em saídas.
      -- RN086: estoque sob reserva ativa é indisponível — só conta status='active',
      -- então finalize_order nunca bloqueia a si mesmo (marca a própria reserva
      -- como 'consumed' antes de chamar o motor, na mesma transação).
      IF v_type = 'withdrawal' THEN
        v_reserved := COALESCE((
          SELECT SUM(quantity) FROM public.stock_reservations
          WHERE status = 'active' AND variant_id = v_variant_id
        ), 0);

        IF (v_current_stock + v_delta) < v_reserved THEN
          IF v_reserved > 0 THEN
            RAISE EXCEPTION 'Estoque insuficiente — há % disponível (% em reserva para pedidos online).',
              v_current_stock - v_reserved, v_reserved;
          ELSE
            RAISE EXCEPTION 'Estoque insuficiente — há % disponível.', v_current_stock;
          END IF;
        END IF;
      END IF;

      IF v_type = 'entry' THEN
        v_total_value := (v_current_stock * v_current_cost) + (ABS(v_qty) * v_input_cost);
        v_new_cost := v_total_value / (v_current_stock + ABS(v_qty));

        UPDATE public.product_variants
        SET stock = stock + v_delta, cost_price = v_new_cost
        WHERE id = v_variant_id;

        v_registered_cost := v_input_cost;
      ELSE
        UPDATE public.product_variants SET stock = stock + v_delta WHERE id = v_variant_id;
        v_registered_cost := v_current_cost;
      END IF;

    -- B. Se for PRODUTO SIMPLES
    ELSIF v_product_id IS NOT NULL THEN
      SELECT stock, cost_price INTO v_current_stock, v_current_cost
      FROM public.products WHERE id = v_product_id FOR UPDATE;

      -- RN055 + RN086: mesma regra do ramo A; reservas de produto simples têm variant_id NULL.
      IF v_type = 'withdrawal' THEN
        v_reserved := COALESCE((
          SELECT SUM(quantity) FROM public.stock_reservations
          WHERE status = 'active' AND product_id = v_product_id AND variant_id IS NULL
        ), 0);

        IF (v_current_stock + v_delta) < v_reserved THEN
          IF v_reserved > 0 THEN
            RAISE EXCEPTION 'Estoque insuficiente — há % disponível (% em reserva para pedidos online).',
              v_current_stock - v_reserved, v_reserved;
          ELSE
            RAISE EXCEPTION 'Estoque insuficiente — há % disponível.', v_current_stock;
          END IF;
        END IF;
      END IF;

      IF v_type = 'entry' THEN
        v_total_value := (v_current_stock * v_current_cost) + (ABS(v_qty) * v_input_cost);
        IF (v_current_stock + ABS(v_qty)) > 0 THEN
             v_new_cost := v_total_value / (v_current_stock + ABS(v_qty));
        ELSE
             v_new_cost := v_input_cost;
        END IF;

        UPDATE public.products
        SET stock = stock + v_delta, cost_price = v_new_cost
        WHERE id = v_product_id;

        v_registered_cost := v_input_cost;
      ELSE
        UPDATE public.products SET stock = stock + v_delta WHERE id = v_product_id;
        v_registered_cost := v_current_cost;
      END IF;
    END IF;

    -- 4. Grava Histórico
    INSERT INTO public.movement_items (movement_id, product_id, variant_id, quantity, unit_cost, unit_price)
    VALUES (
      v_movement_id,
      v_product_id,
      v_variant_id,
      ABS(v_qty),
      v_registered_cost,
      (v_item_data->>'unit_price')::NUMERIC
    );
  END LOOP;

  RETURN v_movement_id;
END;
$$;
