-- DASH-02 · reflete 07_rpc_functions.sql
-- GET_ATTENTION_SUMMARY (RF036): bloco 1 do Dashboard — contagens acionáveis
-- da org do usuário autenticado, recortadas por papel (RN091): Sales só
-- recebe "expiring_soon" (pool perto de expirar); Owner/Manager recebem os
-- três. Reusa a janela de 30 min de notify_expiring_orders/PED-03
-- (RN085/RN089) e a regra de estoque crítico/zerado de get_low_stock_count
-- (RN050, 10_realtime.sql).
CREATE OR REPLACE FUNCTION public.get_attention_summary(p_organization_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.app_role;
  v_expiring_soon INTEGER;
  v_pending_orders INTEGER;
  v_low_stock INTEGER;
BEGIN
  IF NOT public.is_org_member(p_organization_id) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT role INTO v_role
  FROM public.organization_members
  WHERE organization_id = p_organization_id
    AND profile_id = auth.uid();

  SELECT COUNT(*) INTO v_expiring_soon
  FROM public.orders
  WHERE organization_id = p_organization_id
    AND status = 'pending'
    AND seller_id IS NULL
    AND expires_at IS NOT NULL
    AND expires_at <= now() + interval '30 minutes';

  IF v_role = 'sales' THEN
    RETURN jsonb_build_object('expiring_soon', v_expiring_soon);
  END IF;

  SELECT COUNT(*) INTO v_pending_orders
  FROM public.orders
  WHERE organization_id = p_organization_id
    AND status = 'pending';

  v_low_stock := public.get_low_stock_count(p_organization_id);

  RETURN jsonb_build_object(
    'pending_orders', v_pending_orders,
    'low_stock', v_low_stock,
    'expiring_soon', v_expiring_soon
  );
END;
$$;
