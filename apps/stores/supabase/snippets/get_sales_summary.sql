-- DASH-03 · reflete 12_sales_summary.sql
-- GET_SALES_SUMMARY (RF037): bloco 2 do Dashboard — faturamento + nº de
-- vendas + série do gráfico de área empilhado (balcão × pedidos) no
-- período informado, recortado por papel (RN090/RN091): Sales só recebe
-- own_sales_today (próprias vendas do dia); margem média e inventário a
-- custo só para Owner.
CREATE INDEX IF NOT EXISTS idx_orders_org_status_sale_date
  ON public.orders (organization_id, status, COALESCE(finalized_at, created_at));

CREATE OR REPLACE FUNCTION public.get_sales_summary(
  p_organization_id UUID,
  p_period TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.app_role;
  v_now TIMESTAMPTZ := now();
  v_start TIMESTAMPTZ;
  v_prev_start TIMESTAMPTZ;
  v_bucket_interval INTERVAL;
  v_revenue_total NUMERIC;
  v_sales_count INTEGER;
  v_prev_revenue_total NUMERIC;
  v_trend NUMERIC;
  v_series JSONB;
  v_inventory_at_cost NUMERIC;
  v_cogs NUMERIC;
  v_avg_margin NUMERIC;
  v_own_count INTEGER;
  v_own_total NUMERIC;
BEGIN
  IF NOT public.is_org_member(p_organization_id) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT role INTO v_role
  FROM public.organization_members
  WHERE organization_id = p_organization_id
    AND profile_id = auth.uid();

  IF v_role = 'sales' THEN
    SELECT COUNT(*), COALESCE(SUM(total_amount), 0)
    INTO v_own_count, v_own_total
    FROM public.orders
    WHERE organization_id = p_organization_id
      AND seller_id = auth.uid()
      AND channel = 'pos'
      AND status = 'confirmed'
      AND created_at >= date_trunc('day', v_now);

    RETURN jsonb_build_object(
      'own_sales_today',
      jsonb_build_object('count', v_own_count, 'total', v_own_total)
    );
  END IF;

  CASE p_period
    WHEN 'today' THEN
      v_start := date_trunc('day', v_now);
      v_prev_start := v_start - interval '1 day';
      v_bucket_interval := interval '1 hour';
    WHEN '7d' THEN
      v_start := date_trunc('day', v_now) - interval '6 days';
      v_prev_start := v_start - interval '7 days';
      v_bucket_interval := interval '1 day';
    WHEN '90d' THEN
      v_start := date_trunc('day', v_now) - interval '89 days';
      v_prev_start := v_start - interval '90 days';
      v_bucket_interval := interval '1 day';
    ELSE
      v_start := date_trunc('day', v_now) - interval '29 days';
      v_prev_start := v_start - interval '30 days';
      v_bucket_interval := interval '1 day';
  END CASE;

  SELECT COALESCE(SUM(total_amount), 0), COUNT(*)
  INTO v_revenue_total, v_sales_count
  FROM public.orders
  WHERE organization_id = p_organization_id
    AND channel IN ('pos', 'catalog_store')
    AND status = 'confirmed'
    AND COALESCE(finalized_at, created_at) >= v_start
    AND COALESCE(finalized_at, created_at) <= v_now;

  SELECT COALESCE(SUM(total_amount), 0)
  INTO v_prev_revenue_total
  FROM public.orders
  WHERE organization_id = p_organization_id
    AND channel IN ('pos', 'catalog_store')
    AND status = 'confirmed'
    AND COALESCE(finalized_at, created_at) >= v_prev_start
    AND COALESCE(finalized_at, created_at) < v_start;

  v_trend := CASE
    WHEN v_prev_revenue_total > 0
      THEN round(((v_revenue_total - v_prev_revenue_total) / v_prev_revenue_total) * 100, 1)
    WHEN v_revenue_total > 0 THEN 100
    ELSE 0
  END;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'date', to_char(bucket, 'YYYY-MM-DD"T"HH24:MI:SS'),
    'pos', COALESCE(agg.pos_total, 0),
    'online', COALESCE(agg.online_total, 0)
  ) ORDER BY bucket), '[]'::jsonb)
  INTO v_series
  FROM generate_series(v_start, v_now, v_bucket_interval) AS bucket
  LEFT JOIN LATERAL (
    SELECT
      SUM(total_amount) FILTER (WHERE channel = 'pos') AS pos_total,
      SUM(total_amount) FILTER (WHERE channel = 'catalog_store') AS online_total
    FROM public.orders
    WHERE organization_id = p_organization_id
      AND channel IN ('pos', 'catalog_store')
      AND status = 'confirmed'
      AND COALESCE(finalized_at, created_at) >= bucket
      AND COALESCE(finalized_at, created_at) < bucket + v_bucket_interval
  ) agg ON true;

  IF v_role != 'owner' THEN
    RETURN jsonb_build_object(
      'revenue_total', v_revenue_total,
      'sales_count', v_sales_count,
      'series', v_series,
      'trend', v_trend
    );
  END IF;

  SELECT COALESCE(SUM(stock * cost_price), 0)
  INTO v_inventory_at_cost
  FROM (
    SELECT stock, cost_price FROM public.products
    WHERE organization_id = p_organization_id
      AND deleted_at IS NULL
      AND has_variants = false
    UNION ALL
    SELECT v.stock, v.cost_price
    FROM public.product_variants v
    JOIN public.products p ON v.product_id = p.id
    WHERE v.organization_id = p_organization_id
      AND v.deleted_at IS NULL
      AND p.deleted_at IS NULL
  ) inventory;

  SELECT COALESCE(SUM(oi.quantity * COALESCE(pv.cost_price, p.cost_price, 0)), 0)
  INTO v_cogs
  FROM public.order_items oi
  JOIN public.orders o ON o.id = oi.order_id
  LEFT JOIN public.product_variants pv ON pv.id = oi.variant_id
  LEFT JOIN public.products p ON p.id = oi.product_id
  WHERE o.organization_id = p_organization_id
    AND o.channel IN ('pos', 'catalog_store')
    AND o.status = 'confirmed'
    AND COALESCE(o.finalized_at, o.created_at) >= v_start
    AND COALESCE(o.finalized_at, o.created_at) <= v_now;

  v_avg_margin := CASE
    WHEN v_revenue_total > 0 THEN round((v_revenue_total - v_cogs) / v_revenue_total, 4)
    ELSE 0
  END;

  RETURN jsonb_build_object(
    'revenue_total', v_revenue_total,
    'sales_count', v_sales_count,
    'series', v_series,
    'trend', v_trend,
    'inventory_at_cost', v_inventory_at_cost,
    'avg_margin', v_avg_margin
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_sales_summary(UUID, TEXT) TO authenticated;
