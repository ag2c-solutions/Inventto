import type {
  MovementReason as DomainMovementReason,
  MovementType
} from '../../../../domain/entities';

export const ENTRY_REASONS = [
  'Compra',
  'Devolução(entrada)',
  'Transferência(entrada)',
  'Outro'
] as const;
export const WITHDRAWAL_REASONS = [
  'Venda',
  'Devolução(saída)',
  'Transferência(saída)',
  'Consumo',
  'Outro'
] as const;
export const ADJUSTMENT_REASONS = [
  'Inventário',
  'Perda',
  'Correção',
  'Outro'
] as const;

export type EntryReason = (typeof ENTRY_REASONS)[number];
export type WithdrawalReason = (typeof WITHDRAWAL_REASONS)[number];
export type AdjustmentReason = (typeof ADJUSTMENT_REASONS)[number];

export type MovementReason = DomainMovementReason;

export const ReasonOptions: Record<MovementType, readonly string[]> = {
  entry: ENTRY_REASONS,
  withdrawal: WITHDRAWAL_REASONS,
  adjustment: ADJUSTMENT_REASONS
};
