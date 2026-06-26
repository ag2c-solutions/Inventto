-- PROD-03 · RN038 — RPC de disponibilidade de SKU (validação em tempo real).
CREATE OR REPLACE FUNCTION public.check_product_sku_available(
  p_organization_id UUID,
  p_sku TEXT,
  p_exclude_product_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_org_member(p_organization_id) THEN
    RAISE EXCEPTION 'Acesso negado: Permissão insuficiente.';
  END IF;

  IF p_sku IS NULL OR btrim(p_sku) = '' THEN
    RETURN FALSE;
  END IF;

  RETURN NOT EXISTS (
    SELECT 1
    FROM public.products
    WHERE organization_id = p_organization_id
      AND deleted_at IS NULL
      AND lower(sku) = lower(btrim(p_sku))
      AND (p_exclude_product_id IS NULL OR id <> p_exclude_product_id)
  );
END;
$$;
