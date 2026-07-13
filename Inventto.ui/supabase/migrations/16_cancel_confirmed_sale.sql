-- ==============================================================================
-- 16_CANCEL_CONFIRMED_SALE.SQL
-- MOV-06 · Estornar venda do PDV (ação em Movimentações)
-- Dependência: 05_sales_schema.sql, 06_movements_schema.sql, 07_rpc_functions.sql,
-- 15_order_cancellation_reason_enum.sql (enum de orders.cancellation_reason).
-- ==============================================================================

-- ==============================================================================
-- CANCEL_CONFIRMED_SALE (RN051/RN056)
-- Estorna um pedido `confirmed` (venda já concretizada, qualquer canal —
-- não amarrada a channel='pos', pra o módulo Pedidos poder reusar depois
-- com pedidos online finalizados). Não edita a movimentação original
-- (RN051): cria uma NOVA movimentação de entrada vinculada ao mesmo
-- order_id, restaurando o estoque a partir de order_items (não confia em
-- itens vindos do client). Reusa create_stock_movement (mesmo motor de
-- create_pos_sale) e a coluna orders.cancellation_reason já criada por PED-01.
-- ==============================================================================
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
  v_movement_id := public.create_stock_movement(v_movement_payload);

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

GRANT EXECUTE ON FUNCTION public.cancel_confirmed_sale(UUID, TEXT) TO authenticated;
