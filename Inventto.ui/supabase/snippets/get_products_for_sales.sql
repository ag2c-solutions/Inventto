-- PROD-10 · RN057 — leitura sanitizada de produtos p/ o papel Sales (sem cost_price),
-- espelho da antiga SELECT_QUERY_SALES. Guard is_org_member. Rode no banco local.

-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_products_for_sales(p_org_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NOT public.is_org_member(p_org_id) THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  SELECT COALESCE(jsonb_agg(product_row ORDER BY created_at DESC), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT
      p.created_at,
      jsonb_build_object(
        'id', p.id,
        'organization_id', p.organization_id,
        'name', p.name,
        'sku', p.sku,
        'description', p.description,
        'stock', p.stock,
        'minimum_stock', p.minimum_stock,
        'has_variants', p.has_variants,
        'is_active', p.is_active,
        'created_at', p.created_at,
        'categories', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'category', jsonb_build_object('id', c.id, 'name', c.name)
          ) ORDER BY c.name)
          FROM public.product_categories pc
          JOIN public.categories c ON c.id = pc.category_id
          WHERE pc.product_id = p.id
        ), '[]'::jsonb),
        'product_attributes', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id', pa.id, 'label', pa.label, 'slug', pa.slug,
            'type', pa.type, 'values', pa."values"
          ) ORDER BY pa.label)
          FROM public.product_attributes pa
          WHERE pa.product_id = p.id
        ), '[]'::jsonb),
        'product_images', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id', pi.id, 'url', pi.url, 'name', pi.name, 'type', pi.type,
            'public_id', pi.public_id, 'is_primary', pi.is_primary
          ) ORDER BY pi.is_primary DESC, pi.created_at)
          FROM public.product_images pi
          WHERE pi.product_id = p.id
        ), '[]'::jsonb),
        'product_variants', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id', v.id, 'sku', v.sku, 'stock', v.stock,
            'minimum_stock', v.minimum_stock, 'is_active', v.is_active,
            'options', v.options,
            'product_variant_images', COALESCE((
              SELECT jsonb_agg(jsonb_build_object(
                'image_id', pvi.image_id, 'is_primary', pvi.is_primary
              ))
              FROM public.product_variant_images pvi
              WHERE pvi.variant_id = v.id
            ), '[]'::jsonb)
          ) ORDER BY v.created_at)
          FROM public.product_variants v
          WHERE v.product_id = p.id
        ), '[]'::jsonb)
      ) AS product_row
    FROM public.products p
    WHERE p.organization_id = p_org_id
      AND p.deleted_at IS NULL
      AND p.is_active = true
  ) sub;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_products_for_sales(UUID) TO authenticated;
