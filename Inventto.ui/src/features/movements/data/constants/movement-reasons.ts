import type { MovementReasonDTO } from '../../data/dtos';
import type { MovementReason } from '../../domain/entities';

export const MOVEMENT_REASONS_DTO: Record<MovementReason, MovementReasonDTO> = {
  Compra: 'purchase',
  'Devolução(entrada)': 'return_in',
  'Transferência(entrada)': 'transfer_in',
  Venda: 'sale',
  'Devolução(saída)': 'return_out',
  'Transferência(saída)': 'transfer_out',
  Inventário: 'inventory',
  Correção: 'correction',
  Consumo: 'consumption',
  Perda: 'loss',
  Outro: 'other'
} as const;

export const MOVEMENT_REASONS: Record<MovementReasonDTO, MovementReason> = {
  purchase: 'Compra',
  return_in: 'Devolução(entrada)',
  transfer_in: 'Transferência(entrada)',
  sale: 'Venda',
  return_out: 'Devolução(saída)',
  transfer_out: 'Transferência(saída)',
  inventory: 'Inventário',
  correction: 'Correção',
  consumption: 'Consumo',
  loss: 'Perda',
  other: 'Outro'
} as const;
