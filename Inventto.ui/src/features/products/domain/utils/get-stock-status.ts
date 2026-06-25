import type { ProductStockStatus } from '../entities';

/**
 * Deriva o status de estoque de um saldo conforme a RN050 (4 estados):
 * - saldo <= 0 → `zeroed` (esgotado, neutro — não vermelho);
 * - mínimo > 0 e saldo <= mínimo → `critical`;
 * - mínimo > 0 e saldo <= mínimo × 1,25 (zona de buffer) → `warning`;
 * - caso contrário → `healthy`.
 *
 * Quando o mínimo é 0 (ou indefinido) só existem dois estados: `zeroed` (≤ 0)
 * e `healthy` (> 0).
 */
export const getStockStatus = (
  stockValue: number,
  minimumStock?: number
): ProductStockStatus => {
  if (stockValue <= 0) {
    return 'zeroed';
  }

  if (minimumStock !== undefined && minimumStock > 0) {
    if (stockValue <= minimumStock) {
      return 'critical';
    }

    if (stockValue <= minimumStock * 1.25) {
      return 'warning';
    }
  }

  return 'healthy';
};
