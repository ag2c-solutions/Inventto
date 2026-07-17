-- MOV-03 · RN051 — data da transação (executed_at) separada do carimbo de auditoria (created_at)
-- + coluna description (motivo "Outro" — RN053). Rode este snippet no banco local de desenvolvimento.

ALTER TABLE public.movements ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.movements ADD COLUMN IF NOT EXISTS executed_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_movements_executed ON public.movements(executed_at DESC);
