-- MOV-06 · reflete 15_order_cancellation_reason_enum.sql
-- Motivo de cancelamento/estorno de pedido vira enum real (não texto
-- livre) — coluna compartilhada por cancel_order (PED-01/05) e
-- cancel_confirmed_sale (MOV-06).
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
      'Falta de estoque',
      'Cliente solicitou',
      'Dados inválidos',
      'Área não atendida',
      'Expirou no Pool',
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
