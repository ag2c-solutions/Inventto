-- MOV-08 — remove as policies de INSERT legadas do papel Sales em movements/
-- movement_items. Sales não registra movimentação manual (espec § recorte do
-- papel); a escrita real é toda via RPC SECURITY DEFINER de qualquer forma
-- (verificado: nenhum caminho do app faz .insert direto nessas tabelas), e as
-- baixas por venda do Sales entram por create_stock_movement_internal.
-- Rode no banco local.

DROP POLICY IF EXISTS "Sales can create movements" ON public.movements;
DROP POLICY IF EXISTS "Sales create items" ON public.movement_items;
