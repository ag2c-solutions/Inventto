-- ==============================================================================
-- 11_ORGANIZATION_LIFECYCLE.SQL
-- Ciclo de vida da organização: status de ativação + desativar/reativar (RF010)
-- Dependências: 01_base_tables.sql (organizations), 02_security_helpers.sql (has_role),
--               05_sales_schema.sql (orders)
-- ==============================================================================

-- ==============================================================================
-- 1. STATUS DA ORGANIZAÇÃO
-- Modelo único de ativação (comporta reativação — RF010 — e é estendido por
-- ORG-06 para o estado de exclusão/retenção).
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'organization_status') THEN
    CREATE TYPE public.organization_status AS ENUM ('active', 'inactive');
  END IF;
END$$;

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS status public.organization_status NOT NULL DEFAULT 'active';

-- ==============================================================================
-- 2. RPC: DESATIVAR ORGANIZAÇÃO (RF010, RN020, RN027, RN028)
-- A mudança de status passa pela RPC SECURITY DEFINER (não há policy de UPDATE
-- direto de status). Reversível via reactivate_organization.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.deactivate_organization(p_org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- RN020: apenas Owner pode desativar (mesmo via acesso direto).
  IF NOT public.has_role(p_org_id, 'owner') THEN
    RAISE EXCEPTION 'Acesso negado: apenas o proprietário pode desativar a organização.';
  END IF;

  -- Pausa a operação da organização.
  UPDATE public.organizations
  SET status = 'inactive', updated_at = NOW()
  WHERE id = p_org_id;

  -- RN027: pedidos pendentes são cancelados e o estoque, liberado.
  -- (Não há tabela de reservas de estoque no schema atual; quando existir,
  -- liberar as reservas associadas aqui dentro da mesma transação.)
  UPDATE public.orders
  SET status = 'cancelled', updated_at = NOW()
  WHERE organization_id = p_org_id
  AND status = 'pending';

  -- RN028: storefronts/vitrines saem do ar. Gancho documentado — depende do
  -- módulo Storefront (tabela ainda não existe no schema). A vitrine deriva o
  -- status de abertura do status da organização ('inactive').
END;
$$;

-- ==============================================================================
-- 3. RPC: REATIVAR ORGANIZAÇÃO (caminho simétrico — RF010)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.reactivate_organization(p_org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(p_org_id, 'owner') THEN
    RAISE EXCEPTION 'Acesso negado: apenas o proprietário pode reativar a organização.';
  END IF;

  UPDATE public.organizations
  SET status = 'active', updated_at = NOW()
  WHERE id = p_org_id;
END;
$$;
