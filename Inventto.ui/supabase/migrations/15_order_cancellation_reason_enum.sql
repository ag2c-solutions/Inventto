-- ==============================================================================
-- 15_ORDER_CANCELLATION_REASON_ENUM.SQL
-- MOV-06 · motivo do estorno como enum real (não texto livre) — pedido do
-- usuário: sem isso, análise futura de casos de devolução fica inviável.
-- Dependência: 05_sales_schema.sql (coluna orders.cancellation_reason),
-- 07_rpc_functions.sql (cancel_order, PED-01/05, escreve na mesma coluna).
-- Roda ANTES de 16_cancel_confirmed_sale.sql, que referencia este enum.
-- ==============================================================================

-- orders.cancellation_reason é COMPARTILHADA por dois fluxos: cancel_order
-- (PED-01/05, motivo de pedido não confirmado) e cancel_confirmed_sale
-- (MOV-06, motivo de estorno de venda já confirmada). O enum precisa cobrir
-- os dois conjuntos — nunca há conflito em uso real, porque um pedido só
-- pode passar por UM dos dois fluxos (o status já garante isso).

-- Normaliza dados existentes ANTES do ALTER COLUMN: o seed (seed-v2.sql)
-- gerava valores que nunca bateram com o array real ORDER_CANCEL_REASONS
-- do frontend (divergência pré-existente, achada só agora por causa do
-- enum) — mapeados para o mais próximo semanticamente.
UPDATE public.orders
SET cancellation_reason = 'Cliente solicitou'
WHERE cancellation_reason = 'Cliente desistiu';

UPDATE public.orders
SET cancellation_reason = 'Área não atendida'
WHERE cancellation_reason = 'Endereço fora da área de entrega';

UPDATE public.orders
SET cancellation_reason = 'Dados inválidos'
WHERE cancellation_reason = 'Pedido duplicado';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_cancellation_reason') THEN
    CREATE TYPE public.order_cancellation_reason AS ENUM (
      -- PED-01/05 · cancel_order (pedido ainda não confirmado)
      'Falta de estoque',
      'Cliente solicitou',
      'Dados inválidos',
      'Área não atendida',
      -- gerado pelo cron expire_stale_orders() (RN085) — não é opção da UI
      'Expirou no Pool',
      -- MOV-06 · cancel_confirmed_sale (venda já confirmada, estorno)
      'Cliente desistiu da compra',
      'Produto com defeito ou avariado',
      'Erro no registro da venda',
      'Venda duplicada',
      'Pagamento não aprovado / estornado pela operadora',
      'Outro'
    );
  END IF;
END $$;

ALTER TABLE public.orders
  ALTER COLUMN cancellation_reason TYPE public.order_cancellation_reason
  USING cancellation_reason::public.order_cancellation_reason;
