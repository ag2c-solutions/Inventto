import type { MovementType } from '../../../../domain/entities';

export const ENTRY_REASONS = ['Compra', 'Devolução'] as const;
export const WITHDRAWAL_REASONS = ['Venda', 'Troca', 'Uso Interno'] as const;
export const ADJUSTMENT_REASONS = [
  'Perda / Avaria',
  'Ajuste de Inventário'
] as const;

export type EntryReason = (typeof ENTRY_REASONS)[number];
export type WithdrawalReason = (typeof WITHDRAWAL_REASONS)[number];
export type AdjustmentReason = (typeof ADJUSTMENT_REASONS)[number];

export type MovementReason = EntryReason | WithdrawalReason | AdjustmentReason;

export const ReasonOptions: Record<MovementType, readonly string[]> = {
  entry: ENTRY_REASONS,
  withdrawal: WITHDRAWAL_REASONS,
  adjustment: ADJUSTMENT_REASONS
};
