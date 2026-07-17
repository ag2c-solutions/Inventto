-- PDV-02/03 · RN069 — referência/desconto por unidade em order_items.
-- Aplicar no SQL editor do Supabase. Reflete 05_sales_schema.sql.

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS reference_price numeric(10, 2);

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS discount_amount numeric(10, 2) NOT NULL DEFAULT 0;
