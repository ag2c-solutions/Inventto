-- PED-01 · reflete 00_types_and_enums.sql
-- Esteira de fulfillment: pending → confirming → picking → delivering → confirmed.
-- ALTER TYPE ... ADD VALUE não pode rodar dentro de transação com outros comandos
-- que usem o tipo — rodar cada bloco isoladamente no SQL editor.
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'confirming' AFTER 'pending';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'picking' AFTER 'confirming';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'delivering' AFTER 'picking';
