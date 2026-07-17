-- VIT-05 · RN077/RN059: reflete a RPC set_storefront_feature em 11_storefronts_schema.sql.
-- Depende de storefronts_table.sql, storefront_featured_products.sql e catalog_items (05_sales_schema.sql).
CREATE OR REPLACE FUNCTION public.set_storefront_feature(
  p_storefront_id UUID,
  p_product_id UUID,
  p_variant_id UUID DEFAULT NULL,
  p_on BOOLEAN DEFAULT true
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_catalog_id UUID;
BEGIN
  SELECT organization_id, catalog_id INTO v_org_id, v_catalog_id
  FROM public.storefronts
  WHERE id = p_storefront_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Vitrine não encontrada.';
  END IF;

  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem destacar produtos.';
  END IF;

  IF p_on THEN
    IF v_catalog_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.catalog_items
      WHERE catalog_id = v_catalog_id
        AND product_id = p_product_id
        AND variant_id IS NOT DISTINCT FROM p_variant_id
    ) THEN
      RAISE EXCEPTION 'Este produto não pertence ao catálogo vinculado a esta vitrine.';
    END IF;

    INSERT INTO public.storefront_featured_products (storefront_id, product_id, variant_id)
    VALUES (p_storefront_id, p_product_id, p_variant_id)
    ON CONFLICT (storefront_id, product_id) DO NOTHING;
  ELSE
    DELETE FROM public.storefront_featured_products
    WHERE storefront_id = p_storefront_id AND product_id = p_product_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_storefront_feature(UUID, UUID, UUID, BOOLEAN) TO authenticated;
