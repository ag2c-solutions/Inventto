-- Altera o Enum
ALTER TYPE public.organization_status ADD VALUE IF NOT EXISTS 'deleted';

-- Cria a RPC
CREATE OR REPLACE FUNCTION public.delete_organization(p_org_id UUID, p_purge BOOLEAN DEFAULT false)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(p_org_id, 'owner') THEN
    RAISE EXCEPTION 'Acesso negado: apenas o proprietário pode excluir a organização.';
  END IF;

  UPDATE public.orders
  SET status = 'cancelled', updated_at = NOW()
  WHERE organization_id = p_org_id
  AND status = 'pending';

  IF p_purge = false THEN
    UPDATE public.organizations
    SET status = 'deleted', updated_at = NOW()
    WHERE id = p_org_id;
  ELSE
    DELETE FROM public.organizations WHERE id = p_org_id;
  END IF;
END;
$$;
