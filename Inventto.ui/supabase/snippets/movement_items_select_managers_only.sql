-- MOV-08 · RN057 — movement_items carrega unit_cost; a herança da movement pai
-- deixava o Sales ler o custo das próprias linhas via query direta no PostgREST.
-- Leitura direta passa a ser Manager/Owner; o Sales lê o histórico via RPC
-- get_movements_for_sales (sem custo). Rode no banco local.

DROP POLICY IF EXISTS "Inherit movement access items" ON public.movement_items;

CREATE POLICY "Managers can view movement items" ON public.movement_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.movements
    WHERE id = movement_items.movement_id
    AND public.has_role(organization_id, 'manager')
  )
);
