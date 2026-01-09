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
BEGIN
  SELECT role INTO v_user_role
  FROM public.organization_members
  WHERE organization_id = p_org_id
  AND profile_id = auth.uid();

  IF v_user_role IS NULL THEN RETURN FALSE; END IF;

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

-- ==============================================================================
-- 3. POLICIES PARA AS TABELAS BASE (Definidas no arquivo 01)
-- Agora que as funções existem, podemos proteger as tabelas.
-- ==============================================================================

-- A. PROFILES
CREATE POLICY "Users can see own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can see co-workers" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_members my_orgs
    JOIN public.organization_members their_orgs ON my_orgs.organization_id = their_orgs.organization_id
    WHERE my_orgs.profile_id = auth.uid() AND their_orgs.profile_id = public.profiles.id
  )
);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- B. ORGANIZATIONS
CREATE POLICY "Members can view organization" ON public.organizations
FOR SELECT USING (public.is_org_member(id));

CREATE POLICY "Owners can update organization" ON public.organizations
FOR UPDATE USING (public.has_role(id, 'owner'));

-- C. MEMBERS
CREATE POLICY "Members can view list of members" ON public.organization_members
FOR SELECT USING (public.is_org_member(organization_id));