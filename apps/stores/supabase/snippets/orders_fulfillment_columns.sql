-- PED-01 · reflete 05_sales_schema.sql
-- Colunas da esteira de fulfillment em orders (RN083/RN084/RN086/RN087).
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_address jsonb,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS claimed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS finalized_at timestamp with time zone;
