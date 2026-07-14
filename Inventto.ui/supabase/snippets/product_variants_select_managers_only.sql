-- PROD-10 · RN057 — product_variants carrega cost_price; a policy de SELECT aberta
-- a qualquer membro deixava o papel Sales ler custo via query direta no PostgREST.
-- Leitura direta passa a ser Manager/Owner (mesmo recorte de products); o Sales lê
-- via RPCs sanitizadas (get_products_for_sales / get_pdv_catalog_items).
-- Managers seguem cobertos também pela policy "Managers can manage variants" (FOR ALL).
-- Rode no banco local.

DROP POLICY IF EXISTS "Members can view variants" ON public.product_variants;

CREATE POLICY "Managers can view variants" ON public.product_variants
FOR SELECT USING (
  public.is_org_member(organization_id)
  AND public.has_role(organization_id, 'manager')
);
