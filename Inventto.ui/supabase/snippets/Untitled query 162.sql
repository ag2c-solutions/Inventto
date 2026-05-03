-- Função para replicar um membro existente para a organização atual
CREATE OR REPLACE FUNCTION public.replicate_member(
  p_organization_id UUID,
  p_user_id UUID,
  p_role public.app_role
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Roda como admin para garantir acesso
SET search_path = public
AS $$
BEGIN
  -- 1. Verificação de Segurança: Quem chama deve ser Manager/Owner da Org destino
  IF NOT public.has_role(p_organization_id, 'owner') THEN
    RAISE EXCEPTION 'Acesso negado: Apenas gerentes podem adicionar membros.';
  END IF;

  -- 2. Inserção Atômica (Idempotente)
  INSERT INTO public.organization_members (organization_id, profile_id, role, status)
  VALUES (p_organization_id, p_user_id, p_role, 'invited')
  ON CONFLICT (organization_id, profile_id) 
  DO UPDATE SET role = p_role, status = 'active'; -- Se já existir (inativo), reativa
END;
$$;