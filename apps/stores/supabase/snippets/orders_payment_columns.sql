-- PDV-05 — colunas de pagamento em orders, para a instância em execução.
-- Aplicar no SQL editor do Supabase. Reflete 05_sales_schema.sql.
-- Depende de payment_method_enum.sql.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method public.payment_method;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS amount_paid numeric(10, 2);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_proof_url text;
