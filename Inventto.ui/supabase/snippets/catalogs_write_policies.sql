-- CAT-01 · RN062 — catalogs só tinha policy de SELECT; writes ficavam bloqueados por RLS.
-- Adiciona INSERT/UPDATE/DELETE para Manager/Owner.
CREATE POLICY "Managers can create catalogs" ON public.catalogs
FOR INSERT WITH CHECK (public.has_role(organization_id, 'manager'));

CREATE POLICY "Managers can update catalogs" ON public.catalogs
FOR UPDATE USING (public.has_role(organization_id, 'manager'));

CREATE POLICY "Managers can delete catalogs" ON public.catalogs
FOR DELETE USING (public.has_role(organization_id, 'manager'));
