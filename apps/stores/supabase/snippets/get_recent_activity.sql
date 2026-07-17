-- DASH-04 · reflete 13_recent_activity.sql
-- GET_RECENT_ACTIVITY (RF038): bloco 3 do Dashboard — últimas 5
-- movimentações + últimos 5 pedidos da org para Manager/Owner; últimas 5
-- vendas de balcão do próprio vendedor para Sales (RN090/RN091).
CREATE INDEX IF NOT EXISTS idx_orders_org_updated
  ON public.orders (organization_id, updated_at DESC);

CREATE OR REPLACE FUNCTION public.get_recent_activity(p_organization_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.app_role;
  v_own_recent_sales JSONB;
  v_recent_movements JSONB;
  v_recent_orders JSONB;
BEGIN
  IF NOT public.is_org_member(p_organization_id) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT role INTO v_role
  FROM public.organization_members
  WHERE organization_id = p_organization_id
    AND profile_id = auth.uid();

  IF v_role = 'sales' THEN
    WITH recent AS (
      SELECT
        o.id,
        o.total_amount,
        o.updated_at,
        (SELECT COUNT(*) FROM public.order_items WHERE order_id = o.id) AS items_count
      FROM public.orders o
      WHERE o.organization_id = p_organization_id
        AND o.seller_id = auth.uid()
        AND o.channel = 'pos'
        AND o.status = 'confirmed'
      ORDER BY o.updated_at DESC
      LIMIT 5
    )
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'id', id,
      'code', upper(left(id::text, 8)),
      'items_count', items_count,
      'total', total_amount,
      'updated_at', updated_at
    )), '[]'::jsonb)
    INTO v_own_recent_sales
    FROM recent;

    RETURN jsonb_build_object('own_recent_sales', v_own_recent_sales);
  END IF;

  WITH recent_moves AS (
    SELECT
      m.id,
      m.type,
      m.reason,
      m.executed_at,
      COALESCE(
        (SELECT SUM(quantity) FROM public.movement_items WHERE movement_id = m.id), 0
      ) AS total_quantity,
      (SELECT COUNT(*) FROM public.movement_items WHERE movement_id = m.id) AS items_count
    FROM public.movements m
    WHERE m.organization_id = p_organization_id
    ORDER BY m.executed_at DESC
    LIMIT 5
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id,
    'type', type,
    'reason', reason,
    'total_quantity', total_quantity,
    'items_count', items_count,
    'executed_at', executed_at
  )), '[]'::jsonb)
  INTO v_recent_movements
  FROM recent_moves;

  WITH recent_ord AS (
    SELECT
      o.id,
      o.customer_name_snapshot,
      o.status,
      o.total_amount,
      o.updated_at
    FROM public.orders o
    WHERE o.organization_id = p_organization_id
    ORDER BY o.updated_at DESC
    LIMIT 5
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id,
    'code', upper(left(id::text, 8)),
    'customer_name', customer_name_snapshot,
    'status', status,
    'total', total_amount,
    'updated_at', updated_at
  )), '[]'::jsonb)
  INTO v_recent_orders
  FROM recent_ord;

  RETURN jsonb_build_object(
    'recent_movements', v_recent_movements,
    'recent_orders', v_recent_orders
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_recent_activity(UUID) TO authenticated;
