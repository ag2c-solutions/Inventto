-- PED-01 · reflete 05_sales_schema.sql
-- Corrige o vazamento do pool: catalog_store só entra na visão do Sales quando
-- seller_id IS NULL (não-atribuído). Antes, Sales via também os já assumidos
-- por outros (RN082/RN088).
DROP POLICY IF EXISTS "Access Control for Orders" ON public.orders;
CREATE POLICY "Access Control for Orders" ON public.orders
FOR SELECT USING (
  public.is_org_member(organization_id)
  AND (
    public.has_role(organization_id, 'manager')
    OR
    seller_id = auth.uid()
    OR
    (channel = 'catalog_store' AND seller_id IS NULL)
  )
);
