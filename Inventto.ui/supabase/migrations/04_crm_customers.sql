-- ==============================================================================
-- 04_CRM_CUSTOMERS.SQL
-- Módulo: Gestão de Clientes (CRM Multi-loja)
-- Dependência: 02_security_helpers.sql (Policies)
-- ==============================================================================

-- 1. TABELA CUSTOMERS (Identidade Global)
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  phone text NOT NULL,
  last_fingerprint_id text,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT customers_pkey PRIMARY KEY (id),
  CONSTRAINT customers_phone_key UNIQUE (phone)
);

CREATE TRIGGER handle_updated_at_customers 
BEFORE UPDATE ON public.customers 
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 2. TABELA CUSTOMER_STORE_PROFILES (Perfil na Loja)
CREATE TABLE public.customer_store_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,

  name text NOT NULL,
  email text,

  metadata jsonb DEFAULT '{}'::jsonb,
  total_spent numeric(10, 2) DEFAULT 0,
  last_purchase_at timestamp with time zone,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT customer_store_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT unique_customer_per_store UNIQUE (organization_id, customer_id)
);

CREATE TRIGGER handle_updated_at_store_profiles 
BEFORE UPDATE ON public.customer_store_profiles 
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ==============================================================================
-- ÍNDICES DE PERFORMANCE
-- ==============================================================================
-- Busca rápida por telefone (Checkout)
CREATE INDEX idx_customers_phone ON public.customers(phone);

-- Busca rápida de clientes de uma loja (Listagem de CRM)
CREATE INDEX idx_store_profiles_org ON public.customer_store_profiles(organization_id);

-- Busca reversa: "Em quais lojas esse cliente global comprou?" (Análise de Sistema)
CREATE INDEX idx_store_profiles_customer ON public.customer_store_profiles(customer_id);


-- ==============================================================================
-- SEGURANÇA (RLS)
-- ==============================================================================

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_store_profiles ENABLE ROW LEVEL SECURITY;

-- Policy A: Perfil de Loja (Simples)
CREATE POLICY "Members can view store profiles" ON public.customer_store_profiles
FOR SELECT USING (public.is_org_member(organization_id));

-- Policy B: Identidade Global (Join Seguro)
CREATE POLICY "Members can view customers" ON public.customers
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.customer_store_profiles csp 
    WHERE csp.customer_id = public.customers.id 
    AND public.is_org_member(csp.organization_id)
  )
);

-- Escrita: Bloqueada via API direta.
-- Clientes devem ser criados/atualizados via Checkout.