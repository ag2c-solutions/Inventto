import type { MovementReason } from '../../domain/entities';
import type { MovementReasonDTO } from '../dtos';

export const MOVEMENT_REASONS_DTO: Record<MovementReason, MovementReasonDTO> = {
  // RN053 — motivos vigentes
  Compra: 'purchase',
  'Devolução de cliente': 'customer_return',
  'Ajuste de inventário (+)': 'adjustment_in',
  'Perda/Avaria': 'loss_damage',
  'Devolução a fornecedor': 'supplier_return',
  'Uso interno': 'internal_use',
  'Ajuste de inventário (−)': 'adjustment_out',
  Outro: 'other',
  // motivos legados
  'Devolução(entrada)': 'return_in',
  'Transferência(entrada)': 'transfer_in',
  Venda: 'sale',
  'Devolução(saída)': 'return_out',
  'Transferência(saída)': 'transfer_out',
  Inventário: 'inventory',
  Correção: 'correction',
  Consumo: 'consumption',
  Perda: 'loss'
} as const;

export const MOVEMENT_REASONS: Record<MovementReasonDTO, MovementReason> = {
  // RN053 — motivos vigentes
  purchase: 'Compra',
  customer_return: 'Devolução de cliente',
  adjustment_in: 'Ajuste de inventário (+)',
  loss_damage: 'Perda/Avaria',
  supplier_return: 'Devolução a fornecedor',
  internal_use: 'Uso interno',
  adjustment_out: 'Ajuste de inventário (−)',
  other: 'Outro',
  // motivos legados
  return_in: 'Devolução(entrada)',
  transfer_in: 'Transferência(entrada)',
  sale: 'Venda',
  return_out: 'Devolução(saída)',
  transfer_out: 'Transferência(saída)',
  inventory: 'Inventário',
  correction: 'Correção',
  consumption: 'Consumo',
  loss: 'Perda'
} as const;
