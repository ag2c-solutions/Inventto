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
    -- Agora aceita tanto 'active' quanto 'invited'
    AND status IN ('active', 'invited') 
  );
$$;