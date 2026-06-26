-- PROD-03 · RN046 — categorias são create-only/rename; exclusão proibida.
-- Substitui a policy "Managers can manage categories" (FOR ALL, que permitia DELETE)
-- por policies de INSERT e UPDATE apenas.
DROP POLICY IF EXISTS "Managers can manage categories" ON public.categories;

CREATE POLICY "Managers can create categories" ON public.categories
  FOR INSERT WITH CHECK (public.has_role(organization_id, 'manager'));

CREATE POLICY "Managers can update categories" ON public.categories
  FOR UPDATE USING (public.has_role(organization_id, 'manager'));
