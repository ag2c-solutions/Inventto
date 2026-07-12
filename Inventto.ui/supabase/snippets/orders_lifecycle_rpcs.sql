-- PED-01 · reflete 07_rpc_functions.sql (bloco "PAINEL DE PEDIDOS — ESTEIRA DE FULFILLMENT")
-- Pré-requisitos: order_status_add_fulfillment.sql, orders_fulfillment_columns.sql,
-- stock_reservations.sql já aplicados.

CREATE OR REPLACE FUNCTION public.available_stock(
  p_product_id UUID,
  p_variant_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    COALESCE(
      CASE WHEN p_variant_id IS NOT NULL
        THEN (SELECT stock FROM public.product_variants WHERE id = p_variant_id)
        ELSE (SELECT stock FROM public.products WHERE id = p_product_id)
      END, 0
    )
    - COALESCE(
        (SELECT SUM(quantity) FROM public.stock_reservations
         WHERE status = 'active'
           AND product_id = p_product_id
           AND variant_id IS NOT DISTINCT FROM p_variant_id),
        0
      );
$$;

CREATE OR REPLACE FUNCTION public.claim_order(p_id UUID)
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
BEGIN
  SELECT organization_id, status, seller_id INTO v_org_id, v_status, v_seller_id
  FROM public.orders WHERE id = p_id
  FOR UPDATE;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Pedido não encontrado.';
  END IF;

  IF NOT public.is_org_member(v_org_id) THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  IF v_status <> 'pending' OR v_seller_id IS NOT NULL THEN
    RAISE EXCEPTION 'ORDER_ALREADY_CLAIMED';
  END IF;

  UPDATE public.orders
  SET status = 'confirming', seller_id = v_user_id, claimed_at = now(), expires_at = NULL
  WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_order(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.advance_order(p_id UUID)
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
  v_next public.order_status;
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

  v_next := CASE v_status
    WHEN 'confirming' THEN 'picking'
    WHEN 'picking' THEN 'delivering'
    ELSE NULL
  END;

  IF v_next IS NULL THEN
    RAISE EXCEPTION 'ORDER_INVALID_TRANSITION';
  END IF;

  UPDATE public.orders SET status = v_next WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.advance_order(UUID) TO authenticated;

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
    PERFORM public.create_stock_movement(v_movement_payload);
  END IF;

  UPDATE public.orders SET status = 'confirmed', finalized_at = now() WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.finalize_order(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.cancel_order(p_id UUID, p_reason TEXT)
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
BEGIN
  IF NULLIF(TRIM(p_reason), '') IS NULL THEN
    RAISE EXCEPTION 'Informe o motivo do cancelamento.';
  END IF;

  SELECT organization_id, status, seller_id INTO v_org_id, v_status, v_seller_id
  FROM public.orders WHERE id = p_id
  FOR UPDATE;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Pedido não encontrado.';
  END IF;

  IF NOT (public.has_role(v_org_id, 'manager') OR v_seller_id = v_user_id) THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  IF v_status NOT IN ('pending', 'confirming', 'picking', 'delivering') THEN
    RAISE EXCEPTION 'ORDER_INVALID_TRANSITION';
  END IF;

  UPDATE public.stock_reservations SET status = 'released'
  WHERE order_id = p_id AND status = 'active';

  UPDATE public.orders
  SET status = 'cancelled', cancellation_reason = p_reason
  WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_order(UUID, TEXT) TO authenticated;
