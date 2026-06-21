-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Create RPC to count low stock products and variants
CREATE OR REPLACE FUNCTION public.get_low_stock_count(p_organization_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  -- Verify if user is member of the organization
  IF NOT public.is_org_member(p_organization_id) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM (
    -- Simple products (has_variants = false)
    SELECT id
    FROM public.products
    WHERE organization_id = p_organization_id
      AND deleted_at IS NULL
      AND is_active = true
      AND has_variants = false
      AND (stock <= minimum_stock OR stock <= 0)

    UNION ALL

    -- Variants
    SELECT v.id
    FROM public.product_variants v
    JOIN public.products p ON v.product_id = p.id
    WHERE v.organization_id = p_organization_id
      AND p.deleted_at IS NULL
      AND v.deleted_at IS NULL
      AND p.is_active = true
      AND v.is_active = true
      AND (v.stock <= v.minimum_stock OR v.stock <= 0)
  ) AS low_stock_items;

  RETURN v_count;
END;
$$;
