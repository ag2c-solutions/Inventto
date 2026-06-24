-- ==============================================================================
-- 02_SECURITY_HELPERS.SQL
-- Funções Auxiliares + Policies das Tabelas Base
-- Dependência: 01_base_tables.sql
-- ==============================================================================

-- 1. HELPER BÁSICO: is_org_member
CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.organization_members 
    WHERE organization_id = p_org_id 
    AND profile_id = auth.uid()
    AND status IN ('active', 'invited') 
  );
$$;

-- 2. HELPER AVANÇADO: has_role
CREATE OR REPLACE FUNCTION public.has_role(p_org_id UUID, p_required_role public.app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_user_role public.app_role;
  v_status text;
BEGIN
  SELECT role, status INTO v_user_role, v_status
  FROM public.organization_members
  WHERE organization_id = p_org_id
  AND profile_id = auth.uid();

  -- Se não existe ou está inativo, nega acesso
  IF v_user_role IS NULL OR v_status <> 'active' THEN RETURN FALSE; END IF;

  IF p_required_role = 'owner' THEN
    RETURN v_user_role = 'owner';
  ELSIF p_required_role = 'manager' THEN
    RETURN v_user_role IN ('owner', 'manager');
  ELSIF p_required_role = 'sales' THEN
    RETURN v_user_role IN ('owner', 'manager', 'sales');
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- 3. TRIGGER: Sincronização de Email (Auth -> Profile)
CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles
    SET email = NEW.email, updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_update ON auth.users;
CREATE TRIGGER on_auth_user_email_update
AFTER UPDATE OF email ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_user_email_update();

-- ==============================================================================
-- 4. POLICIES PARA AS TABELAS BASE
-- ==============================================================================

-- A. PROFILES
CREATE POLICY "Users can see own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Managers can view org members" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 
    FROM public.organization_members my_mem
    JOIN public.organization_members target_mem 
      ON my_mem.organization_id = target_mem.organization_id
    WHERE 
      my_mem.profile_id = auth.uid() 
      AND target_mem.profile_id = public.profiles.id
      AND my_mem.role IN ('owner', 'manager') 
  )
);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- organization_members NÃO tem policy de UPDATE/DELETE direto pelo client (RN036/RN037):
-- a edição de função/status passa exclusivamente pelos RPCs Owner-only
-- update_member_role/update_member_status (07_rpc_functions.sql), onde os
-- invariantes do Owner (não-owner, não-self, sem 'invited') são garantidos.
-- A exclusão definitiva de membro é proibida na v1 (apenas inativação — RN036).

-- B. ORGANIZATIONS
CREATE POLICY "Members can view organization" ON public.organizations
FOR SELECT USING (
  public.is_org_member(id) AND
  (status = 'active' OR public.has_role(id, 'owner'))
);

CREATE POLICY "Owners can update organization" ON public.organizations
FOR UPDATE USING (public.has_role(id, 'owner'));

-- C. MEMBERS
CREATE POLICY "Members can view list of members" ON public.organization_members
FOR SELECT USING (public.is_org_member(organization_id));

-- ==============================================================================
-- 7. ATIVAÇÃO DE SEGURANÇA
-- ==============================================================================
ALTER TABLE public.business_area_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_area_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_attributes  ENABLE ROW LEVEL SECURITY;

-- Leitura pública das áreas de negócio (necessária no signup antes de autenticação)
CREATE POLICY "Anyone can view business area categories"
  ON public.business_area_categories FOR SELECT USING (true);

CREATE POLICY "Anyone can view business area attributes"
  ON public.business_area_attributes FOR SELECT USING (true);

-- organization_attributes: acesso restrito a membros da org
CREATE POLICY "Members can view organization attributes"
  ON public.organization_attributes FOR SELECT
  USING (public.is_org_member(organization_id));

CREATE POLICY "Managers can manage organization attributes"
  ON public.organization_attributes FOR ALL
  USING (public.has_role(organization_id, 'manager'));
