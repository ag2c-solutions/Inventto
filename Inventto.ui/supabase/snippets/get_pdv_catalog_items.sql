-- PROD-10 — itens do catálogo do PDV com produto/variante embutidos (sem custo),
-- espelho do antigo ITEM_SELECT_QUERY do PDV. Usada por todos os papéis. Rode no banco local.

-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_pdv_catalog_items(p_catalog_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_result JSONB;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM public.catalogs WHERE id = p_catalog_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Catálogo não encontrado.';
  END IF;

  IF NOT public.is_org_member(v_org_id) THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  SELECT COALESCE(jsonb_agg(item_row ORDER BY item_id), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT
      ci.id AS item_id,
      jsonb_build_object(
        'id', ci.id,
        'product_id', ci.product_id,
        'variant_id', ci.variant_id,
        'price', ci.price,
        'product', (
          SELECT jsonb_build_object(
            'id', pr.id, 'name', pr.name, 'sku', pr.sku, 'stock', pr.stock,
            'product_images', COALESCE((
              SELECT jsonb_agg(jsonb_build_object('url', pi.url, 'is_primary', pi.is_primary)
                ORDER BY pi.is_primary DESC, pi.created_at)
              FROM public.product_images pi
              WHERE pi.product_id = pr.id
            ), '[]'::jsonb),
            'categories', COALESCE((
              SELECT jsonb_agg(jsonb_build_object(
                'category', jsonb_build_object('id', pc.category_id)
              ))
              FROM public.product_categories pc
              WHERE pc.product_id = pr.id
            ), '[]'::jsonb)
          )
          FROM public.products pr WHERE pr.id = ci.product_id
        ),
        'variant', (
          SELECT jsonb_build_object(
            'id', v.id, 'sku', v.sku, 'stock', v.stock, 'options', v.options
          )
          FROM public.product_variants v WHERE v.id = ci.variant_id
        )
      ) AS item_row
    FROM public.catalog_items ci
    WHERE ci.catalog_id = p_catalog_id
  ) sub;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_pdv_catalog_items(UUID) TO authenticated;
