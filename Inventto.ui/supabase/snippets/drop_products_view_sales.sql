-- PROD-10 · RN017 — remove a view products_view_sales: como view "security definer"
-- sem filtro de organização e com GRANT p/ authenticated, ela bypassava a RLS de
-- products e expunha produtos de todas as orgs a qualquer autenticado. Não tinha
-- nenhum consumidor no frontend. A leitura do papel Sales passa a ser via RPCs
-- sanitizadas (get_products_for_sales / get_pdv_catalog_items). Rode no banco local.

DROP VIEW IF EXISTS public.products_view_sales;
