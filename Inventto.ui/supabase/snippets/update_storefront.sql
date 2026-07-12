-- VIT-03/VIT-04 · RN073: reflete a RPC update_storefront em 11_storefronts_schema.sql.
-- Depende de storefronts_table.sql, reserved_slugs.sql e check_slug_available.sql.
CREATE OR REPLACE FUNCTION public.update_storefront(p_id UUID, payload JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_old_slug TEXT;
  v_new_slug TEXT := NULLIF(trim(payload->>'slug'), '');
  v_check JSONB;
BEGIN
  SELECT organization_id, slug INTO v_org_id, v_old_slug
  FROM public.storefronts
  WHERE id = p_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Vitrine não encontrada.';
  END IF;

  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem editar vitrines.';
  END IF;

  IF v_new_slug IS NOT NULL AND v_new_slug IS DISTINCT FROM v_old_slug THEN
    v_check := public.check_slug_available(v_new_slug, p_id);
    IF NOT (v_check->>'available')::boolean THEN
      RAISE EXCEPTION 'STOREFRONT_SLUG_UNAVAILABLE:%', v_check->>'reason';
    END IF;
  END IF;

  UPDATE public.storefronts SET
    name = COALESCE(payload->>'name', name),
    catalog_id = NULLIF(payload->>'catalogId', '')::uuid,
    slug = COALESCE(v_new_slug, v_old_slug),
    whatsapp = NULLIF(payload->>'whatsapp', ''),
    instagram = NULLIF(payload->>'instagram', ''),
    facebook = NULLIF(payload->>'facebook', ''),
    website = NULLIF(payload->>'website', ''),
    -- VIT-04: bloco de tema (paleta/logo/capa/layout/estilo de card). '->'
    -- (não '->>') porque o valor gravado é jsonb, não texto.
    theme = COALESCE(payload->'theme', theme)
  WHERE id = p_id;

  IF v_old_slug IS NOT NULL AND v_new_slug IS NOT NULL AND v_new_slug IS DISTINCT FROM v_old_slug THEN
    INSERT INTO public.reserved_slugs (slug, organization_id, released_at)
    VALUES (v_old_slug, v_org_id, now() + interval '30 days')
    ON CONFLICT (slug) DO UPDATE SET released_at = EXCLUDED.released_at;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_storefront(UUID, JSONB) TO authenticated;
