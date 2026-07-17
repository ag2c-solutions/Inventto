CREATE OR REPLACE FUNCTION public.get_candidate_members(p_organization_id UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Retorna perfis que:
  -- 1. São membros de QUALQUER organização onde o usuário atual (auth.uid()) é 'owner'
  -- 2. EXCETO aqueles que já são membros da organização alvo (p_organization_id)
  RETURN QUERY
  WITH my_orgs AS (
    SELECT organization_id 
    FROM organization_members 
    WHERE profile_id = auth.uid() 
    AND role IN ('owner')
  )
  SELECT DISTINCT 
    p.id, 
    p.full_name, 
    p.email, 
    p.avatar_url
  FROM profiles p
  JOIN organization_members om ON p.id = om.profile_id
  WHERE om.organization_id IN (SELECT organization_id FROM my_orgs)
  AND p.id NOT IN (
    SELECT profile_id 
    FROM organization_members 
    WHERE organization_id = p_organization_id
  );
END;
$$;