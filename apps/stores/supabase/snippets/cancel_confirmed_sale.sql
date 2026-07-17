-- MOV-06 · reflete 16_cancel_confirmed_sale.sql
-- CANCEL_CONFIRMED_SALE: estorna um pedido `confirmed` (agnóstica a canal),
-- criando uma movimentação de entrada vinculada (RN051 — não edita a
-- original), restaurando estoque a partir de order_items com o custo atual.
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

  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem estornar vendas.';
  END IF;

  IF v_status <> 'confirmed' THEN
    RAISE EXCEPTION 'ORDER_INVALID_TRANSITION';
  END IF;

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

  UPDATE public.orders
  SET
    status = 'cancelled',
    cancellation_reason = p_reason::public.order_cancellation_reason
  WHERE id = p_order_id;

  IF v_customer_id IS NOT NULL THEN
    UPDATE public.customer_store_profiles
    SET total_spent = GREATEST(total_spent - v_total_amount, 0)
    WHERE organization_id = v_org_id AND customer_id = v_customer_id;
  END IF;

  RETURN v_movement_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_confirmed_sale(UUID, TEXT) TO authenticated;
