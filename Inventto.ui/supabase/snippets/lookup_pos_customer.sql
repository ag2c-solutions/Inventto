-- PDV-03 · RN068 — RPC lookup_pos_customer, para a instância em execução.
-- Aplicar no SQL editor do Supabase. Reflete 07_rpc_functions.sql.

CREATE OR REPLACE FUNCTION public.lookup_pos_customer(
  p_organization_id UUID,
  p_phone TEXT
)
RETURNS TABLE (customer_id UUID, name TEXT, since TIMESTAMPTZ)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT c.id, csp.name, csp.created_at
  FROM public.customers c
  JOIN public.customer_store_profiles csp ON csp.customer_id = c.id
  WHERE c.phone = p_phone
    AND csp.organization_id = p_organization_id
    AND public.is_org_member(p_organization_id);
$$;

GRANT EXECUTE ON FUNCTION public.lookup_pos_customer(UUID, TEXT) TO authenticated;
