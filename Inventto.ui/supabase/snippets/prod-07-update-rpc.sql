-- Snippet for updating RPCs for PROD-07
-- You can run this snippet to update your local development database.

-- 1. Create check_product_has_movements
CREATE OR REPLACE FUNCTION public.check_product_has_movements(p_product_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.movement_items WHERE product_id = p_product_id
  );
END;
$$;

-- 2. Create set_product_active
CREATE OR REPLACE FUNCTION public.set_product_active(
  p_product_id UUID,
  p_organization_id UUID,
  p_is_active BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(p_organization_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: Permissão insuficiente.';
  END IF;

  UPDATE public.products SET is_active = p_is_active, updated_at = NOW()
  WHERE id = p_product_id AND organization_id = p_organization_id;

  UPDATE public.product_variants SET is_active = p_is_active
  WHERE product_id = p_product_id AND organization_id = p_organization_id;
END;
$$;
