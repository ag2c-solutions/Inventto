-- VIT-02 · RN075: reflete a RPC publish_storefront em 11_storefronts_schema.sql.
-- Depende de storefronts_table.sql.
CREATE OR REPLACE FUNCTION public.publish_storefront(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_catalog_id UUID;
  v_whatsapp TEXT;
  v_settings JSONB;
  v_timezone TEXT;
  v_has_open_day BOOLEAN;
  v_missing TEXT[] := '{}';
BEGIN
  SELECT organization_id, catalog_id, whatsapp
  INTO v_org_id, v_catalog_id, v_whatsapp
  FROM public.storefronts
  WHERE id = p_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Vitrine não encontrada.';
  END IF;

  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem publicar vitrines.';
  END IF;

  IF v_catalog_id IS NULL THEN
    v_missing := array_append(v_missing, 'catalog');
  END IF;

  IF v_whatsapp IS NULL OR trim(v_whatsapp) = '' THEN
    v_missing := array_append(v_missing, 'whatsapp');
  END IF;

  SELECT settings INTO v_settings FROM public.organizations WHERE id = v_org_id;
  v_timezone := v_settings->'operational'->>'timezone';

  SELECT EXISTS (
    SELECT 1
    FROM jsonb_each(COALESCE(v_settings->'schedule', '{}'::jsonb)) AS day(key, value)
    WHERE (value->>'is_open')::boolean IS TRUE
  ) INTO v_has_open_day;

  IF v_timezone IS NULL OR trim(v_timezone) = '' OR NOT v_has_open_day THEN
    v_missing := array_append(v_missing, 'hours');
  END IF;

  IF array_length(v_missing, 1) > 0 THEN
    RAISE EXCEPTION 'STOREFRONT_PREREQS_MISSING:%', array_to_string(v_missing, ',');
  END IF;

  UPDATE public.storefronts
  SET status = 'active', published_at = now()
  WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_storefront(UUID) TO authenticated;
