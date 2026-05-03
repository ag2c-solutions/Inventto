CREATE OR REPLACE FUNCTION public.create_new_organization(
  p_name TEXT,
  p_slug TEXT,
  p_document TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Roda como admin para garantir permissões iniciais
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_user_id UUID := auth.uid();
BEGIN
  -- 1. Validação de Slug Único
  IF EXISTS (SELECT 1 FROM public.organizations WHERE slug = p_slug) THEN
    RAISE EXCEPTION 'Este identificador (slug) já está em uso por outra organização.';
  END IF;

  -- 2. Inserção da Organização
  INSERT INTO public.organizations (name, slug, document, owner_id)
  VALUES (p_name, p_slug, p_document, v_user_id)
  RETURNING id INTO v_org_id;

  -- 3. Inserção do Membro (Dono)
  -- A Trigger handle_new_user não roda aqui, pois é contexto de auth.users
  INSERT INTO public.organization_members (organization_id, profile_id, role, status)
  VALUES (v_org_id, v_user_id, 'owner', 'active');

  RETURN v_org_id;
END;
$$;