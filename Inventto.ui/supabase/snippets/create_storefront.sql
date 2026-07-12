-- VIT-03 · reflete a RPC create_storefront em 11_storefronts_schema.sql.
-- Depende de storefronts_table.sql e check_slug_available.sql.
CREATE OR REPLACE FUNCTION public.create_storefront(payload JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID := (payload->>'organizationId')::uuid;
  v_slug TEXT := NULLIF(trim(payload->>'slug'), '');
  v_check JSONB;
  v_id UUID;
BEGIN
  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem criar vitrines.';
  END IF;

  IF v_slug IS NOT NULL THEN
    v_check := public.check_slug_available(v_slug, NULL);
    IF NOT (v_check->>'available')::boolean THEN
      RAISE EXCEPTION 'STOREFRONT_SLUG_UNAVAILABLE:%', v_check->>'reason';
    END IF;
  END IF;

  INSERT INTO public.storefronts (
    organization_id, name, catalog_id, slug, whatsapp, instagram, facebook, website
  ) VALUES (
    v_org_id,
    payload->>'name',
    NULLIF(payload->>'catalogId', '')::uuid,
    v_slug,
    NULLIF(payload->>'whatsapp', ''),
    NULLIF(payload->>'instagram', ''),
    NULLIF(payload->>'facebook', ''),
    NULLIF(payload->>'website', '')
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_storefront(JSONB) TO authenticated;
