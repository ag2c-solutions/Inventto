-- EQ-02 — Edição inline de Função/Status (RPCs Owner-only) para a instância em execução.
-- Aplicar no SQL editor do Supabase. Reflete 07_rpc_functions.sql (#13/#14) e a
-- remoção das policies de UPDATE/DELETE direto em organization_members.

-- 1. Remove o caminho de UPDATE/DELETE direto pelo client.
--    A edição de membro passa a ser exclusivamente via RPC (invariantes do Owner).
DROP POLICY IF EXISTS "Managers can update members of their org" ON public.organization_members;
DROP POLICY IF EXISTS "Owners can delete members" ON public.organization_members;

-- 2. RPC: atualizar função do membro (RF014, RN020, RN037).
CREATE OR REPLACE FUNCTION public.update_member_role(
  p_member_id UUID,
  p_role public.app_role
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_target_role public.app_role;
BEGIN
  IF p_role NOT IN ('manager', 'sales') THEN
    RAISE EXCEPTION 'Função inválida: apenas Gerente ou Vendedor podem ser atribuídos.';
  END IF;

  SELECT organization_id, role INTO v_org_id, v_target_role
  FROM public.organization_members
  WHERE id = p_member_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Membro não encontrado.';
  END IF;

  IF NOT public.has_role(v_org_id, 'owner') THEN
    RAISE EXCEPTION 'Acesso negado: apenas o proprietário pode gerir membros.';
  END IF;

  IF v_target_role = 'owner' THEN
    RAISE EXCEPTION 'O proprietário não pode ter a função alterada.';
  END IF;

  UPDATE public.organization_members
  SET role = p_role, updated_at = NOW()
  WHERE id = p_member_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_member_role(UUID, public.app_role) TO authenticated;

-- 3. RPC: atualizar status do membro (RF014, RN036, RN037).
CREATE OR REPLACE FUNCTION public.update_member_status(
  p_member_id UUID,
  p_status public.member_status
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_target_role public.app_role;
BEGIN
  IF p_status NOT IN ('active', 'inactive') THEN
    RAISE EXCEPTION 'Status inválido: apenas Ativo ou Inativo podem ser definidos.';
  END IF;

  SELECT organization_id, role INTO v_org_id, v_target_role
  FROM public.organization_members
  WHERE id = p_member_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Membro não encontrado.';
  END IF;

  IF NOT public.has_role(v_org_id, 'owner') THEN
    RAISE EXCEPTION 'Acesso negado: apenas o proprietário pode gerir membros.';
  END IF;

  IF v_target_role = 'owner' THEN
    RAISE EXCEPTION 'O proprietário não pode ter o status alterado.';
  END IF;

  UPDATE public.organization_members
  SET status = p_status, updated_at = NOW()
  WHERE id = p_member_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_member_status(UUID, public.member_status) TO authenticated;
