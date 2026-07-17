-- VIT-03 · RN072/RN073: reflete a RPC check_slug_available em 11_storefronts_schema.sql.
-- Depende de storefronts_table.sql e reserved_slugs.sql.
CREATE OR REPLACE FUNCTION public.check_slug_available(
  p_slug TEXT,
  p_storefront_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reserved TEXT[] := ARRAY[
    'auth', 'admin', 'api', 'app', 'login', 'signup', 'onboarding',
    'storefronts', 'settings', 'team', 'products', 'movements', 'catalogos',
    'pdv', 'dashboard', 'novo'
  ];
BEGIN
  IF p_slug IS NULL
    OR p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    OR length(p_slug) < 3
    OR length(p_slug) > 50
    OR p_slug = ANY(v_reserved)
  THEN
    RETURN jsonb_build_object('available', false, 'reason', 'invalid');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.storefronts
    WHERE slug = p_slug AND (p_storefront_id IS NULL OR id != p_storefront_id)
  ) THEN
    RETURN jsonb_build_object('available', false, 'reason', 'taken');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.reserved_slugs
    WHERE slug = p_slug AND released_at > now()
  ) THEN
    RETURN jsonb_build_object('available', false, 'reason', 'reserved');
  END IF;

  RETURN jsonb_build_object('available', true, 'reason', 'ok');
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_slug_available(TEXT, UUID) TO authenticated;
