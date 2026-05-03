-- Arquivo: migrations/10_confirm_first_access_rpc.sql

CREATE OR REPLACE FUNCTION public.confirm_first_access(p_user_id UUID, p_organization_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Roda com permissões de admin para garantir a escrita
SET search_path = public
AS $$
BEGIN
  -- 1. Atualiza o Profile (Remove a obrigatoriedade de senha)
  UPDATE public.profiles
  SET 
    must_change_password = false,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- 2. Atualiza o Status do Membro (Ativa o usuário na organização)
  UPDATE public.organization_members
  SET status = 'active'
  WHERE profile_id = p_user_id
  AND organization_id = p_organization_id;
  
  -- Verifica se algo foi alterado (Opcional, para debug)
 IF NOT FOUND THEN
    RAISE WARNING 'Nenhum vínculo encontrado para User % na Org %', p_user_id, p_organization_id;
  END IF;
END;
$$;