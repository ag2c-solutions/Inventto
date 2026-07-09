-- CAT-04 · RN061/RN062 — remoção de catálogo com guard de canais vinculados
-- no servidor. Rode este snippet no banco local de desenvolvimento.
CREATE OR REPLACE FUNCTION public.delete_catalog(p_catalog_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_linked_channels INTEGER := 0;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM public.catalogs
  WHERE id = p_catalog_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Catálogo não encontrado.';
  END IF;

  -- RN062: apenas Manager/Owner da organização removem catálogos.
  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem remover catálogos.';
  END IF;

  -- RN061: canais vinculados bloqueiam a remoção. As fontes de vínculo
  -- (storefronts.catalog_id — Módulo 8; config do PDV — Módulo 7) ainda não
  -- existem; quando existirem, somar as contagens aqui. Ex.:
  --   v_linked_channels := v_linked_channels +
  --     (SELECT COUNT(*) FROM public.storefronts WHERE catalog_id = p_catalog_id);

  IF v_linked_channels > 0 THEN
    -- Marcador estável mapeado pela UI para a variante B do dialog.
    RAISE EXCEPTION 'CATALOG_HAS_LINKED_CHANNELS';
  END IF;

  -- Cascata remove catalog_items; orders.catalog_id é ON DELETE SET NULL,
  -- então pedidos preservam o histórico (RN061).
  DELETE FROM public.catalogs WHERE id = p_catalog_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_catalog(UUID) TO authenticated;
