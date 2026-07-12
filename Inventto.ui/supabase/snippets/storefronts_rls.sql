-- VIT-01: reflete as policies de storefronts em 11_storefronts_schema.sql.
-- Depende de storefronts_table.sql.
ALTER TABLE public.storefronts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view storefronts" ON public.storefronts;
CREATE POLICY "Members can view storefronts" ON public.storefronts
FOR SELECT USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Managers can create storefronts" ON public.storefronts;
CREATE POLICY "Managers can create storefronts" ON public.storefronts
FOR INSERT WITH CHECK (public.has_role(organization_id, 'manager'));

DROP POLICY IF EXISTS "Managers can update storefronts" ON public.storefronts;
CREATE POLICY "Managers can update storefronts" ON public.storefronts
FOR UPDATE USING (public.has_role(organization_id, 'manager'));

DROP POLICY IF EXISTS "Managers can delete storefronts" ON public.storefronts;
CREATE POLICY "Managers can delete storefronts" ON public.storefronts
FOR DELETE USING (public.has_role(organization_id, 'manager'));
