-- MOV-08 — split do motor de movimentações. A INTERNA carrega toda a lógica (sem
-- restrição de papel; EXECUTE revogado de anon/authenticated) e é chamada por
-- create_pos_sale/finalize_order/cancel_confirmed_sale — a venda do Sales continua
-- funcionando. O wrapper público (a RPC que o client chama) bloqueia Sales:
-- não registra movimentação manual (espec § recorte do papel). Rode no banco local.

CREATE OR REPLACE FUNCTION public.create_stock_movement_internal(movement_data JSONB)
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

REVOKE EXECUTE ON FUNCTION public.create_stock_movement_internal(JSONB) FROM PUBLIC, anon, authenticated;

-- Wrapper público (a RPC que o client chama): registro MANUAL de movimentação.
-- MOV-08: Sales não registra movimentação manual — bloqueado aqui no servidor,
-- não só na UI. As baixas por venda do Sales entram pela interna.
CREATE OR REPLACE FUNCTION public.create_stock_movement(movement_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.app_role;
BEGIN
  SELECT role INTO v_role FROM public.organization_members
  WHERE profile_id = auth.uid()
    AND organization_id = (movement_data->>'organization_id')::UUID;

  IF v_role IS NULL THEN RAISE EXCEPTION 'Acesso negado.'; END IF;

  IF v_role = 'sales' THEN
    RAISE EXCEPTION 'Permissão negada: Vendedores não registram movimentações manuais.';
  END IF;

  RETURN public.create_stock_movement_internal(movement_data);
END;
$$;

-- ==============================================================================
-- Callers repontados para a interna (CREATE OR REPLACE preserva os GRANTs):
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.create_pos_sale(sale_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_org_id UUID;
  v_catalog_id UUID;
  v_customer_phone TEXT;
  v_customer_name TEXT;
  v_customer_id UUID;
  v_order_id UUID;
  v_total_amount NUMERIC := 0;
  v_item JSONB;
  v_product_name TEXT;
  v_movement_items JSONB := '[]'::jsonb;
  v_movement_payload JSONB;
  v_payment_method public.payment_method;
  v_amount_paid NUMERIC;
  v_payment_proof_url TEXT;
BEGIN
  v_org_id := (sale_data->>'organization_id')::UUID;
  v_catalog_id := (sale_data->>'catalog_id')::UUID;

  -- RN067: Sales/Manager/Owner registram venda — qualquer membro ativo da org.
  IF NOT public.is_org_member(v_org_id) THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  IF sale_data->'items' IS NULL OR jsonb_array_length(sale_data->'items') = 0 THEN
    RAISE EXCEPTION 'A venda precisa ter ao menos um item.';
  END IF;

  -- PDV-05: forma de pagamento obrigatória; troco (dinheiro) revalidado no
  -- servidor — não confiar só na checagem do client.
  v_payment_method := NULLIF(sale_data->>'payment_method', '')::public.payment_method;
  IF v_payment_method IS NULL THEN
    RAISE EXCEPTION 'Selecione a forma de pagamento.';
  END IF;

  v_amount_paid := (sale_data->>'amount_paid')::NUMERIC;
  v_payment_proof_url := NULLIF(sale_data->>'payment_proof_url', '');

  -- RN068: cliente opcional — telefone identifica/cria o cliente global
  -- (identidade compartilhada entre lojas) + perfil nesta loja; sem
  -- telefone, venda anônima (customer_id permanece NULL).
  v_customer_phone := NULLIF(TRIM(sale_data->'customer'->>'phone'), '');
  v_customer_name := NULLIF(TRIM(sale_data->'customer'->>'name'), '');

  IF v_customer_phone IS NOT NULL THEN
    INSERT INTO public.customers (phone)
    VALUES (v_customer_phone)
    ON CONFLICT (phone) DO UPDATE SET updated_at = now()
    RETURNING id INTO v_customer_id;

    -- Só cria o perfil se ainda não existir nesta org — cliente já conhecido
    -- mantém o nome cadastrado (a UI só pede nome para cliente novo).
    INSERT INTO public.customer_store_profiles (organization_id, customer_id, name)
    VALUES (v_org_id, v_customer_id, COALESCE(v_customer_name, 'Cliente'))
    ON CONFLICT (organization_id, customer_id) DO NOTHING;

    SELECT name INTO v_customer_name
    FROM public.customer_store_profiles
    WHERE organization_id = v_org_id AND customer_id = v_customer_id;
  END IF;

  -- Total da venda: soma dos preços finais (referência − desconto) já
  -- praticados por item — reference_price/discount_amount são por unidade.
  SELECT COALESCE(SUM((item->>'unit_price')::NUMERIC * (item->>'quantity')::INTEGER), 0)
  INTO v_total_amount
  FROM jsonb_array_elements(sale_data->'items') AS item;

  -- PDV-05: em dinheiro, o valor recebido não pode ser menor que o total —
  -- mesma regra já checada no client, revalidada aqui.
  IF v_payment_method = 'cash' AND (v_amount_paid IS NULL OR v_amount_paid < v_total_amount) THEN
    RAISE EXCEPTION 'O valor recebido é menor que o total da venda.';
  END IF;

  INSERT INTO public.orders (
    organization_id, customer_id, seller_id,
    customer_name_snapshot, customer_phone_snapshot,
    channel, catalog_id, status, total_amount,
    payment_method, amount_paid, payment_proof_url
  )
  VALUES (
    v_org_id, v_customer_id, v_user_id,
    v_customer_name, v_customer_phone,
    'pos', v_catalog_id, 'confirmed', v_total_amount,
    v_payment_method,
    CASE WHEN v_payment_method = 'cash' THEN v_amount_paid ELSE NULL END,
    v_payment_proof_url
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(sale_data->'items')
  LOOP
    SELECT name INTO v_product_name
    FROM public.products WHERE id = (v_item->>'product_id')::UUID;

    INSERT INTO public.order_items (
      order_id, product_id, variant_id, quantity,
      unit_price, reference_price, discount_amount, product_name_snapshot
    )
    VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'variant_id')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::NUMERIC,
      (v_item->>'reference_price')::NUMERIC,
      COALESCE((v_item->>'discount_amount')::NUMERIC, 0),
      v_product_name
    );

    v_movement_items := v_movement_items || jsonb_build_object(
      'product_id', v_item->>'product_id',
      'variant_id', v_item->'variant_id',
      'quantity', v_item->>'quantity',
      'unit_price', v_item->>'unit_price'
    );
  END LOOP;

  -- RN066/RN055: baixa de estoque reusa o motor existente de movimentações —
  -- o bloqueio de saldo negativo e o custo médio já vêm de lá. Como é uma
  -- chamada de função dentro da mesma transação, qualquer exceção (saldo
  -- insuficiente) desfaz a venda inteira, pedido incluso.
  v_movement_payload := jsonb_build_object(
    'organization_id', v_org_id,
    'type', 'withdrawal',
    'reason', 'sale',
    'order_id', v_order_id,
    'items', v_movement_items
  );
  PERFORM public.create_stock_movement_internal(v_movement_payload);

  IF v_customer_id IS NOT NULL THEN
    UPDATE public.customer_store_profiles
    SET total_spent = total_spent + v_total_amount, last_purchase_at = now()
    WHERE organization_id = v_org_id AND customer_id = v_customer_id;
  END IF;

  RETURN v_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_order(p_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_org_id UUID;
  v_status public.order_status;
  v_seller_id UUID;
  v_reservation RECORD;
  v_movement_items JSONB := '[]'::jsonb;
  v_movement_payload JSONB;
  v_has_reservations BOOLEAN := false;
BEGIN
  SELECT organization_id, status, seller_id INTO v_org_id, v_status, v_seller_id
  FROM public.orders WHERE id = p_id
  FOR UPDATE;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Pedido não encontrado.';
  END IF;

  IF NOT (public.has_role(v_org_id, 'manager') OR v_seller_id = v_user_id) THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  IF v_status <> 'delivering' THEN
    RAISE EXCEPTION 'ORDER_INVALID_TRANSITION';
  END IF;

  FOR v_reservation IN
    SELECT sr.product_id, sr.variant_id, sr.quantity, oi.unit_price
    FROM public.stock_reservations sr
    LEFT JOIN public.order_items oi
      ON oi.order_id = sr.order_id
      AND oi.product_id = sr.product_id
      AND oi.variant_id IS NOT DISTINCT FROM sr.variant_id
    WHERE sr.order_id = p_id AND sr.status = 'active'
  LOOP
    v_has_reservations := true;
    v_movement_items := v_movement_items || jsonb_build_object(
      'product_id', v_reservation.product_id,
      'variant_id', v_reservation.variant_id,
      'quantity', v_reservation.quantity,
      'unit_price', v_reservation.unit_price
    );
  END LOOP;

  IF v_has_reservations THEN
    UPDATE public.stock_reservations SET status = 'consumed'
    WHERE order_id = p_id AND status = 'active';

    v_movement_payload := jsonb_build_object(
      'organization_id', v_org_id,
      'type', 'withdrawal',
      'reason', 'sale',
      'order_id', p_id,
      'items', v_movement_items
    );
    PERFORM public.create_stock_movement_internal(v_movement_payload);
  END IF;

  UPDATE public.orders SET status = 'confirmed', finalized_at = now() WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_confirmed_sale(
  p_order_id UUID,
  p_reason TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_status public.order_status;
  v_customer_id UUID;
  v_total_amount NUMERIC;
  v_movement_items JSONB;
  v_movement_payload JSONB;
  v_movement_id UUID;
BEGIN
  IF NULLIF(TRIM(p_reason), '') IS NULL THEN
    RAISE EXCEPTION 'Informe o motivo do estorno.';
  END IF;

  SELECT organization_id, status, customer_id, total_amount
  INTO v_org_id, v_status, v_customer_id, v_total_amount
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Pedido não encontrado.';
  END IF;

  -- RN056: mesmo recorte de quem cria/vê todas as movimentações.
  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem estornar vendas.';
  END IF;

  -- Evita estorno duplicado — só uma venda `confirmed` pode ser estornada.
  IF v_status <> 'confirmed' THEN
    RAISE EXCEPTION 'ORDER_INVALID_TRANSITION';
  END IF;

  -- Itens de reversão a partir de order_items (o que foi de fato vendido),
  -- com o custo ATUAL do produto/variante — não há custo histórico por
  -- venda rastreado (mesma limitação/precedente já assumido em
  -- get_sales_summary/DASH-03 pro cálculo de margem).
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'product_id', oi.product_id,
    'variant_id', oi.variant_id,
    'quantity', oi.quantity,
    'unit_cost', COALESCE(pv.cost_price, p.cost_price, 0),
    'unit_price', oi.unit_price
  )), '[]'::jsonb)
  INTO v_movement_items
  FROM public.order_items oi
  LEFT JOIN public.product_variants pv ON pv.id = oi.variant_id
  LEFT JOIN public.products p ON p.id = oi.product_id
  WHERE oi.order_id = p_order_id;

  v_movement_payload := jsonb_build_object(
    'organization_id', v_org_id,
    'type', 'entry',
    'reason', 'return_in',
    'description', p_reason,
    'order_id', p_order_id,
    'items', v_movement_items
  );
  -- MOV-08: chama a interna — o wrapper público bloqueia Sales (registro manual),
  -- e esta função já tem guard próprio de Manager/Owner (RN056).
  v_movement_id := public.create_stock_movement_internal(v_movement_payload);

  -- p_reason é TEXT (não o enum diretamente — evita depender da ordem de
  -- criação do tipo no signature da função); cast explícito porque Postgres
  -- não faz cast implícito de TEXT p/ enum em atribuição de coluna.
  UPDATE public.orders
  SET
    status = 'cancelled',
    cancellation_reason = p_reason::public.order_cancellation_reason
  WHERE id = p_order_id;

  -- Reverte o faturamento do cliente (RF037/DASH-03 já soma só status=
  -- confirmed, então a mudança de status acima já corrige o Dashboard).
  -- last_purchase_at NÃO é revertido (ponto de verificação da task,
  -- resolvido a favor da simplicidade — mesmo precedente do PED-05).
  IF v_customer_id IS NOT NULL THEN
    UPDATE public.customer_store_profiles
    SET total_spent = GREATEST(total_spent - v_total_amount, 0)
    WHERE organization_id = v_org_id AND customer_id = v_customer_id;
  END IF;

  RETURN v_movement_id;
END;
$$;
