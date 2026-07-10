-- PDV-01 · RN065 — vínculo do catálogo do PDV, para a instância em execução.
-- Aplicar no SQL editor do Supabase. Reflete 01_base_tables.sql (coluna) e
-- 05_sales_schema.sql (constraint), já que a instância existente já tem
-- public.catalogs criada.

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS pdv_catalog_id uuid;

ALTER TABLE public.organizations
  DROP CONSTRAINT IF EXISTS organizations_pdv_catalog_id_fkey;

ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_pdv_catalog_id_fkey
  FOREIGN KEY (pdv_catalog_id) REFERENCES public.catalogs(id) ON DELETE SET NULL;
