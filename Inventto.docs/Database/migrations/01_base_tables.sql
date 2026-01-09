-- ==============================================================================
-- 01_BASE_TABLES.SQL
-- Estrutura Base: Perfis, Organizações e Membros
-- Dependência: 00_types_and_enums.sql
-- ==============================================================================

-- 1. UTILS: Função para atualizar o campo 'updated_at' automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ==============================================================================
-- 2. TABELA PROFILES (Extensão do auth.users)
-- ==============================================================================
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

CREATE TRIGGER handle_updated_at_profiles 
BEFORE UPDATE ON public.profiles 
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ==============================================================================
-- 3. TABELA ORGANIZATIONS (Tenant)
-- ==============================================================================
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id),
  
  name text NOT NULL,
  slug text NOT NULL,
  document text, 
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT organizations_pkey PRIMARY KEY (id),
  CONSTRAINT organizations_slug_key UNIQUE (slug)
);

CREATE TRIGGER handle_updated_at_organizations 
BEFORE UPDATE ON public.organizations 
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ==============================================================================
-- 4. TABELA ORGANIZATION_MEMBERS (Junção N:N)
-- ==============================================================================
CREATE TABLE public.organization_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  role public.app_role NOT NULL DEFAULT 'sales',
  
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT organization_members_pkey PRIMARY KEY (id),
  CONSTRAINT unique_member_per_org UNIQUE (organization_id, profile_id)
);

CREATE UNIQUE INDEX idx_single_owner_member 
ON public.organization_members (organization_id) 
WHERE role = 'owner';

CREATE INDEX idx_members_profile_id ON public.organization_members(profile_id);
CREATE INDEX idx_members_org_id ON public.organization_members(organization_id);

-- ==============================================================================
-- 5. ATIVAÇÃO DE SEGURANÇA
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;