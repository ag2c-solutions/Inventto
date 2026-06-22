-- ==============================================================================
-- 01_BASE_TABLES.SQL
-- Estrutura Base: Áreas de Negócio, Perfis, Organizações e Membros
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
-- 2. TABELAS DE ÁREA DE NEGÓCIO (AUTH-01b)
-- ==============================================================================

-- 2a. Catálogo de áreas disponíveis (removido a favor de enum direto)

-- 2b. Categorias-template por área (materializa em public.categories no signup)
CREATE TABLE public.business_area_categories (
  id                 uuid NOT NULL DEFAULT gen_random_uuid(),
  business_area_code public.business_area_code NOT NULL,
  name               text NOT NULL,

  CONSTRAINT business_area_categories_pkey          PRIMARY KEY (id),
  CONSTRAINT business_area_categories_area_name_key UNIQUE (business_area_code, name)
);

-- 2c. Atributos-template por área (materializa em public.organization_attributes no signup)
CREATE TABLE public.business_area_attributes (
  id                 uuid NOT NULL DEFAULT gen_random_uuid(),
  business_area_code public.business_area_code NOT NULL,
  label              text NOT NULL,
  slug               text NOT NULL,
  type               public.attribute_type NOT NULL,
  "values"           jsonb NOT NULL DEFAULT '[]'::jsonb,

  CONSTRAINT business_area_attributes_pkey PRIMARY KEY (id),
  CONSTRAINT business_area_attributes_area_slug_key UNIQUE (business_area_code, slug)
);

-- ==============================================================================
-- 3. TABELA PROFILES (Extensão do auth.users)
-- ==============================================================================
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  must_change_password BOOLEAN DEFAULT false,
  terms_accepted_at timestamp with time zone,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

CREATE TRIGGER handle_updated_at_profiles 
BEFORE UPDATE ON public.profiles 
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ==============================================================================
-- 4. TABELA ORGANIZATIONS (Tenant)
-- ==============================================================================
CREATE TABLE public.organizations (
  id                 uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id           uuid NOT NULL REFERENCES public.profiles(id),
  -- business_area_code: toda org tem uma área; 'other' é válida mas não carrega template.
  business_area_code public.business_area_code NOT NULL DEFAULT 'other',

  name     text NOT NULL,
  document text,
  legal_name text,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);

CREATE TRIGGER handle_updated_at_organizations 
BEFORE UPDATE ON public.organizations 
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ==============================================================================
-- 5. TABELA ORGANIZATION_MEMBERS (Junção N:N)
-- ==============================================================================
CREATE TABLE public.organization_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  status public.member_status NOT NULL DEFAULT 'active',
  role public.app_role NOT NULL DEFAULT 'sales',
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT organization_members_pkey PRIMARY KEY (id),
  CONSTRAINT unique_member_per_org UNIQUE (organization_id, profile_id)
);

CREATE UNIQUE INDEX idx_single_owner_member 
ON public.organization_members (organization_id) 
WHERE role = 'owner';

CREATE INDEX idx_members_profile_id ON public.organization_members(profile_id);
CREATE INDEX idx_members_org_id ON public.organization_members(organization_id);

-- ==============================================================================
-- 6. ATRIBUTOS DA ORGANIZAÇÃO (materialização do template no signup)
-- ==============================================================================
CREATE TABLE public.organization_attributes (
  id              uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  label           text NOT NULL,
  slug            text NOT NULL,
  type            public.attribute_type NOT NULL,
  "values"        jsonb NOT NULL DEFAULT '[]'::jsonb,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  CONSTRAINT organization_attributes_pkey     PRIMARY KEY (id),
  CONSTRAINT organization_attributes_org_slug UNIQUE (organization_id, slug)
);

CREATE TRIGGER handle_updated_at_org_attrs
BEFORE UPDATE ON public.organization_attributes
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

