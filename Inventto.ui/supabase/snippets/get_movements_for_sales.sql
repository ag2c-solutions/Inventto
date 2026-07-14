-- MOV-08 · RN057 — histórico do papel Sales via RPC sanitizada: só as PRÓPRIAS
-- movimentações (user_id = auth.uid()), no shape do SELECT_QUERY do frontend,
-- SEM unit_cost, com produto/variante resolvidos aqui (a RLS de products/variants
-- é Manager/Owner — PROD-10 — então o embed PostgREST viria nulo p/ Sales).
-- Rode no banco local.

CREATE OR REPLACE FUNCTION public.get_movements_for_sales(
  p_org_id UUID,
  p_product_id UUID DEFAULT NULL
)
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

  SELECT COALESCE(jsonb_agg(movement_row ORDER BY created_at DESC), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT
      m.created_at,
      jsonb_build_object(
        'id', m.id,
        'organization_id', m.organization_id,
        'user_id', m.user_id,
        'type', m.type,
        'reason', m.reason,
        'description', m.description,
        'document_number', m.document_number,
        'order_id', m.order_id,
        'created_at', m.created_at,
        'executed_at', m.executed_at,
        'profiles', (
          SELECT jsonb_build_object('full_name', pf.full_name, 'avatar_url', pf.avatar_url)
          FROM public.profiles pf WHERE pf.id = m.user_id
        ),
        'orders', (
          SELECT jsonb_build_object('status', o.status)
          FROM public.orders o WHERE o.id = m.order_id
        ),
        'movement_items', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id', mi.id,
            'movement_id', mi.movement_id,
            'product_id', mi.product_id,
            'variant_id', mi.variant_id,
            'quantity', mi.quantity,
            'unit_price', mi.unit_price,
            'products', (
              SELECT jsonb_build_object(
                'name', pr.name, 'sku', pr.sku,
                'product_images', COALESCE((
                  SELECT jsonb_agg(jsonb_build_object('url', pi.url, 'is_primary', pi.is_primary)
                    ORDER BY pi.is_primary DESC, pi.created_at)
                  FROM public.product_images pi WHERE pi.product_id = pr.id
                ), '[]'::jsonb)
              )
              FROM public.products pr WHERE pr.id = mi.product_id
            ),
            'product_variants', (
              SELECT jsonb_build_object(
                'sku', v.sku, 'options', v.options,
                'product_variant_images', COALESCE((
                  SELECT jsonb_agg(jsonb_build_object(
                    'is_primary', pvi.is_primary,
                    'product_images', (
                      SELECT jsonb_build_object('url', img.url)
                      FROM public.product_images img WHERE img.id = pvi.image_id
                    )
                  ))
                  FROM public.product_variant_images pvi WHERE pvi.variant_id = v.id
                ), '[]'::jsonb)
              )
              FROM public.product_variants v WHERE v.id = mi.variant_id
            )
          ))
          FROM public.movement_items mi
          WHERE mi.movement_id = m.id
            AND (p_product_id IS NULL OR mi.product_id = p_product_id)
        ), '[]'::jsonb)
      ) AS movement_row
    FROM public.movements m
    WHERE m.organization_id = p_org_id
      AND m.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.movement_items mi
        WHERE mi.movement_id = m.id
          AND (p_product_id IS NULL OR mi.product_id = p_product_id)
      )
  ) sub;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_movements_for_sales(UUID, UUID) TO authenticated;
