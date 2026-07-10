-- PDV-01 · RN065 — RPC set_pdv_catalog + guard RN061 em delete_catalog,
-- para a instância em execução. Aplicar no SQL editor do Supabase.
-- Reflete 07_rpc_functions.sql. Depende de organizations_pdv_catalog_id.sql.

CREATE OR REPLACE FUNCTION public.delete_catalog(p_catalog_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_linked_channels INTEGER := 0;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM public.catalogs
  WHERE id = p_catalog_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Catálogo não encontrado.';
  END IF;

  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem remover catálogos.';
  END IF;

  v_linked_channels := v_linked_channels +
    (SELECT COUNT(*) FROM public.organizations WHERE pdv_catalog_id = p_catalog_id);

  IF v_linked_channels > 0 THEN
    RAISE EXCEPTION 'CATALOG_HAS_LINKED_CHANNELS';
  END IF;

  DELETE FROM public.catalogs WHERE id = p_catalog_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_catalog(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.set_pdv_catalog(p_catalog_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_is_active BOOLEAN;
BEGIN
  SELECT organization_id, is_active INTO v_org_id, v_is_active
  FROM public.catalogs
  WHERE id = p_catalog_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Catálogo não encontrado.';
  END IF;

  IF NOT v_is_active THEN
    RAISE EXCEPTION 'Este catálogo está inativo e não pode ser vinculado ao PDV.';
  END IF;

  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem vincular um catálogo ao PDV.';
  END IF;

  UPDATE public.organizations
  SET pdv_catalog_id = p_catalog_id, updated_at = NOW()
  WHERE id = v_org_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_pdv_catalog(UUID) TO authenticated;
