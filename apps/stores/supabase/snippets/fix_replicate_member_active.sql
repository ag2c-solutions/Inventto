-- EQ-03 — Corrige replicate_member para a instância em execução.
-- Aplicar no SQL editor do Supabase. Reflete 07_rpc_functions.sql (#9).
--
-- RF013/RN035 + decisão de produto: o membro replicado compartilha a identidade
-- e já tem acesso ativo, então o vínculo entra 'active' (sem primeiro acesso),
-- não 'invited' como na versão anterior.

CREATE OR REPLACE FUNCTION public.replicate_member(
  p_organization_id UUID,
  p_user_id UUID,
  p_role public.app_role
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Segurança: quem chama deve ser Owner da org de destino (RN020).
  IF NOT public.has_role(p_organization_id, 'owner') THEN
    RAISE EXCEPTION 'Acesso negado: Apenas gerentes podem adicionar membros.';
  END IF;

  -- 2. Inserção atômica e idempotente — membro replicado entra 'active'.
  INSERT INTO public.organization_members (organization_id, profile_id, role, status)
  VALUES (p_organization_id, p_user_id, p_role, 'active')
  ON CONFLICT (organization_id, profile_id)
  DO UPDATE SET role = p_role, status = 'active';
END;
$$;
