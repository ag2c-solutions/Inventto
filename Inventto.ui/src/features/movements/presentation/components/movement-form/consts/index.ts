import type {
  MovementReason as DomainMovementReason,
  MovementType
} from '../../../../domain/entities';

// RN053 — motivo obrigatório, lista por tipo
export const ENTRY_REASONS = [
  'Compra',
  'Devolução de cliente',
  'Ajuste de inventário (+)',
  'Outro'
] as const;
export const WITHDRAWAL_REASONS = [
  'Perda/Avaria',
  'Devolução a fornecedor',
  'Uso interno',
  'Ajuste de inventário (−)',
  'Outro'
] as const;

export type EntryReason = (typeof ENTRY_REASONS)[number];
export type WithdrawalReason = (typeof WITHDRAWAL_REASONS)[number];

export type MovementReason = DomainMovementReason;

export const ReasonOptions: Record<MovementType, readonly string[]> = {
  entry: ENTRY_REASONS,
  withdrawal: WITHDRAWAL_REASONS
};
