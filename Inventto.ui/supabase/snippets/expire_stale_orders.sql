-- PED-03 · reflete 07_rpc_functions.sql
-- Job de expiração (RN085): pedidos pending não assumidos com expires_at
-- vencido migram para "expired" (topo de Cancelados) e liberam a reserva
-- de estoque (RN086). Chamada exclusivamente pelo pg_cron (ver
-- schedule_expire_stale_orders.sql) — não é uma ação do usuário, por isso
-- o EXECUTE é revogado de anon/authenticated (não fica exposto como RPC).
CREATE OR REPLACE FUNCTION public.expire_stale_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.stock_reservations
  SET status = 'released'
  WHERE status = 'active'
    AND order_id IN (
      SELECT id FROM public.orders
      WHERE status = 'pending'
        AND seller_id IS NULL
        AND expires_at IS NOT NULL
        AND expires_at <= now()
    );

  UPDATE public.orders
  SET status = 'expired', cancellation_reason = 'Expirou no Pool'
  WHERE status = 'pending'
    AND seller_id IS NULL
    AND expires_at IS NOT NULL
    AND expires_at <= now();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.expire_stale_orders() FROM PUBLIC, anon, authenticated;
