-- PED-03 · reflete 07_rpc_functions.sql
-- E-mail de resgate (RN089): pool perto de expirar (≤ 30 min, ainda não
-- assumido) dispara e-mail ao Owner/Managers da organização — não ao
-- cliente, não por pedido novo (RF035/RN089). Limiar de 30 min alinhado ao
-- "perto de expirar" do Dashboard (RF036). notified_at evita reenvio.
--
-- Pré-requisitos manuais (não é possível aplicar via código/migration):
--   1. Extensão pg_net habilitada (local: já vem instalada; hospedada:
--      Database > Extensions).
--   2. Segredos no Vault com o projeto e a service role key:
--        select vault.create_secret('http://<host>:<porta>', 'project_url');
--        select vault.create_secret('<service-role-key>', 'service_role_key');
--      Local: valores de `supabase status` (API URL / service_role key).
--      Hospedada: Project Settings > API.
--   Sem esses dois secrets, a função registra um WARNING e não envia nada
--   (não falha o cron).
CREATE OR REPLACE FUNCTION public.notify_expiring_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_recipient RECORD;
  v_project_url text;
  v_service_role_key text;
BEGIN
  SELECT decrypted_secret INTO v_project_url
  FROM vault.decrypted_secrets WHERE name = 'project_url';

  SELECT decrypted_secret INTO v_service_role_key
  FROM vault.decrypted_secrets WHERE name = 'service_role_key';

  IF v_project_url IS NULL OR v_service_role_key IS NULL THEN
    RAISE WARNING 'notify_expiring_orders: vault secrets "project_url"/"service_role_key" não configurados — envio pulado.';
    RETURN;
  END IF;

  FOR v_order IN
    SELECT id, organization_id
    FROM public.orders
    WHERE status = 'pending'
      AND seller_id IS NULL
      AND notified_at IS NULL
      AND expires_at IS NOT NULL
      AND expires_at > now()
      AND expires_at <= now() + interval '30 minutes'
  LOOP
    FOR v_recipient IN
      SELECT p.email
      FROM public.organization_members om
      JOIN public.profiles p ON p.id = om.profile_id
      WHERE om.organization_id = v_order.organization_id
        AND om.role IN ('owner', 'manager')
        AND om.status = 'active'
        AND p.email IS NOT NULL
    LOOP
      PERFORM net.http_post(
        url := v_project_url || '/functions/v1/send-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_role_key
        ),
        body := jsonb_build_object(
          'template', 'order_expiring',
          'to', v_recipient.email,
          'data', jsonb_build_object('orderRef', left(v_order.id::text, 8))
        )
      );
    END LOOP;

    UPDATE public.orders SET notified_at = now() WHERE id = v_order.id;
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.notify_expiring_orders() FROM PUBLIC, anon, authenticated;

SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'notify-expiring-orders';

SELECT cron.schedule(
  'notify-expiring-orders',
  '*/5 * * * *',
  $$ SELECT public.notify_expiring_orders(); $$
);
