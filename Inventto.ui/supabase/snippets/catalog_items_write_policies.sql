-- CAT-03 · RN062/RN063 — catalog_items só tinha policy de SELECT; writes ficavam bloqueados.
-- Adiciona INSERT/UPDATE/DELETE para Manager/Owner.
CREATE POLICY "Managers can create catalog items" ON public.catalog_items
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.catalogs WHERE id = catalog_items.catalog_id AND public.has_role(organization_id, 'manager'))
);

CREATE POLICY "Managers can update catalog items" ON public.catalog_items
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.catalogs WHERE id = catalog_items.catalog_id AND public.has_role(organization_id, 'manager'))
);

CREATE POLICY "Managers can delete catalog items" ON public.catalog_items
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.catalogs WHERE id = catalog_items.catalog_id AND public.has_role(organization_id, 'manager'))
);
