-- PED-03 · reflete 07_rpc_functions.sql
-- Agendador do job de expiração (RN085) — roda a cada 1 min.
-- Pré-requisito: expire_stale_orders.sql já aplicado.
-- Primeiro uso de pg_cron no projeto — a extensão precisa estar habilitada
-- na instância (local: instalada abaixo; hospedada: habilitar em
-- Database > Extensions no dashboard antes de rodar o cron.schedule).
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'expire-stale-orders';

SELECT cron.schedule(
  'expire-stale-orders',
  '* * * * *',
  $$ SELECT public.expire_stale_orders(); $$
);
