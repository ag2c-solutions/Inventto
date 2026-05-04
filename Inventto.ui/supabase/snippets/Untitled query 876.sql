-- 1. Adicionar flag de senha provisória no Profile
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;

-- 2. Atualizar o Trigger handle_new_user para suportar criação direta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_meta JSONB := new.raw_user_meta_data;
BEGIN
  -- Cria o Profile com a flag de senha provisória se vier nos metadados
  INSERT INTO public.profiles (id, email, full_name, avatar_url, must_change_password)
  VALUES (
    new.id, 
    new.email, 
    v_meta->>'full_name', 
    v_meta->>'avatar_url',
    COALESCE((v_meta->>'must_change_password')::boolean, false)
  );

  -- CASO 1: É um Owner criando uma empresa nova
  IF (v_meta->>'company_name') IS NOT NULL THEN
    INSERT INTO public.organizations (name, document, slug, owner_id)
    VALUES (
      v_meta->>'company_name',
      v_meta->>'company_document',
      v_meta->>'company_slug',
      new.id
    )
    RETURNING id INTO v_org_id;

    INSERT INTO public.organization_members (organization_id, profile_id, role, status)
    VALUES (v_org_id, new.id, 'owner', 'active');
  
  -- CASO 2: É um Provisionamento Manual (Admin criando funcionário)
  ELSIF (v_meta->>'organization_id') IS NOT NULL THEN
    INSERT INTO public.organization_members (organization_id, profile_id, role, status)
    VALUES (
      (v_meta->>'organization_id')::uuid, 
      new.id, 
      (v_meta->>'role')::app_role, 
      'invited'
    );
  END IF;

  RETURN new;
END;
$$;