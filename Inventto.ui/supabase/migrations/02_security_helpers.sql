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

CREATE POLICY "Managers can update members of their org"
ON public.organization_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members as requester
    WHERE requester.organization_id = organization_members.organization_id
    AND requester.profile_id = auth.uid()
    AND requester.role IN ('owner', 'manager')
    AND requester.status = 'active'
  )
);

CREATE POLICY "Owners can delete members"
ON public.organization_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members as requester
    WHERE requester.organization_id = organization_members.organization_id
    AND requester.profile_id = auth.uid()
    AND requester.role = 'owner'
  )
);

-- B. ORGANIZATIONS
CREATE POLICY "Members can view organization" ON public.organizations
FOR SELECT USING (public.is_org_member(id));

CREATE POLICY "Owners can update organization" ON public.organizations
FOR UPDATE USING (public.has_role(id, 'owner'));

-- C. MEMBERS
CREATE POLICY "Members can view list of members" ON public.organization_members
FOR SELECT USING (public.is_org_member(organization_id));