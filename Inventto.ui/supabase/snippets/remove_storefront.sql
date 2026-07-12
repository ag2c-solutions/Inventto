-- VIT-02 · RN073: reflete a RPC remove_storefront em 11_storefronts_schema.sql.
-- Depende de storefronts_table.sql e reserved_slugs.sql.
CREATE OR REPLACE FUNCTION public.remove_storefront(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_slug TEXT;
BEGIN
  SELECT organization_id, slug INTO v_org_id, v_slug
  FROM public.storefronts
  WHERE id = p_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Vitrine não encontrada.';
  END IF;

  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem remover vitrines.';
  END IF;

  IF v_slug IS NOT NULL THEN
    INSERT INTO public.reserved_slugs (slug, organization_id, released_at)
    VALUES (v_slug, v_org_id, now() + interval '30 days')
    ON CONFLICT (slug) DO UPDATE SET released_at = EXCLUDED.released_at;
  END IF;

  DELETE FROM public.storefronts WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.remove_storefront(UUID) TO authenticated;
