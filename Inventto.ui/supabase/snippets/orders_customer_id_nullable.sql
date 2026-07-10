-- PDV-03 · RN068 — venda anônima (sem telefone) não tem customer_id.
-- Aplicar no SQL editor do Supabase. Reflete 05_sales_schema.sql.

ALTER TABLE public.orders
  ALTER COLUMN customer_id DROP NOT NULL;
