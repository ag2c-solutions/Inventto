-- DASH-05 · reflete 14_onboarding_status.sql
-- GET_ONBOARDING_STATUS (RN092): estado real da org (produtos, catálogo com
-- item, vitrine publicada, vendas) usado pra decidir onboarding × blocos
-- operacionais no Dashboard.
CREATE OR REPLACE FUNCTION public.get_onboarding_status(p_organization_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_products BOOLEAN;
  v_has_catalog BOOLEAN;
  v_has_published_storefront BOOLEAN;
  v_has_sales BOOLEAN;
BEGIN
  IF NOT public.is_org_member(p_organization_id) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.products
    WHERE organization_id = p_organization_id AND deleted_at IS NULL
  ) INTO v_has_products;

  SELECT EXISTS (
    SELECT 1
    FROM public.catalogs c
    JOIN public.catalog_items ci ON ci.catalog_id = c.id
    WHERE c.organization_id = p_organization_id
  ) INTO v_has_catalog;

  SELECT EXISTS (
    SELECT 1 FROM public.storefronts
    WHERE organization_id = p_organization_id AND status = 'active'
  ) INTO v_has_published_storefront;

  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE organization_id = p_organization_id
      AND (channel = 'pos' OR (channel = 'catalog_store' AND status = 'confirmed'))
  ) INTO v_has_sales;

  RETURN jsonb_build_object(
    'has_products', v_has_products,
    'has_catalog', v_has_catalog,
    'has_published_storefront', v_has_published_storefront,
    'has_sales', v_has_sales
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_onboarding_status(UUID) TO authenticated;
