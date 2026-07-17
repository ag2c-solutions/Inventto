-- VIT-01: reflete a RPC set_storefront_published em 11_storefronts_schema.sql.
-- Depende de storefronts_table.sql.
CREATE OR REPLACE FUNCTION public.set_storefront_published(
  p_id UUID,
  p_published BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM public.storefronts
  WHERE id = p_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Vitrine não encontrada.';
  END IF;

  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem publicar/despublicar vitrines.';
  END IF;

  UPDATE public.storefronts
  SET
    status = CASE WHEN p_published THEN 'active' ELSE 'inactive' END::public.storefront_status,
    published_at = CASE WHEN p_published THEN now() ELSE published_at END
  WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_storefront_published(UUID, BOOLEAN) TO authenticated;
