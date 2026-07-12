-- PED-03 · reflete 05_sales_schema.sql
-- Dedupe do e-mail de resgate (RN089): marca quando o alerta de "pool perto
-- de expirar" já foi enviado, para não reenviar a cada execução do cron.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS notified_at timestamp with time zone;
