-- MOV-03 · RN055 — bug crítico: create_stock_movement permitia saldo negativo em saídas.
-- Adiciona guarda (não permite saldo < 0 na v1), remove o branch morto 'adjustment'
-- (o enum movement_type já não tem esse valor) e passa a gravar executed_at/description.
-- Depende de add_movements_executed_at.sql (colunas executed_at/description). Rode no banco local.

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
      FROM public.product_variants WHERE id = v_variant_id;

      -- RN055: saldo não pode ficar negativo em saídas (v1 não permite backorder;
      -- evolução futura: comparar contra um piso configurável por organização em vez de 0)
      IF v_type = 'withdrawal' AND (v_current_stock + v_delta) < 0 THEN
        RAISE EXCEPTION 'Estoque insuficiente — há % disponível.', v_current_stock;
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
      FROM public.products WHERE id = v_product_id;

      -- RN055: saldo não pode ficar negativo em saídas
      IF v_type = 'withdrawal' AND (v_current_stock + v_delta) < 0 THEN
        RAISE EXCEPTION 'Estoque insuficiente — há % disponível.', v_current_stock;
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
