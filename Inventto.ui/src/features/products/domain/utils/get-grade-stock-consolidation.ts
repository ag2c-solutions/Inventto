import type { IProductVariant } from '../entities';

import { getStockStatus } from './get-stock-status';
import type { StockSummary } from './get-stock-summary-status';

const emptySummary = (): StockSummary => ({
  zeroed: 0,
  critical: 0,
  warning: 0,
  healthy: 0
});

/**
 * Consolidação de saldo de uma grade (RN043): considera apenas as variantes
 * **ativas**. Retorna o total físico (soma dos saldos) e a contagem de
 * variantes por estado de estoque (RN050), para o resumo da grade.
 */
export function getGradeStockConsolidation(variants: IProductVariant[]): {
  total: number;
  summary: StockSummary;
} {
  return variants
    .filter((variant) => variant.isActive)
    .reduce(
      (acc, variant) => {
        acc.total += variant.stock || 0;
        acc.summary[getStockStatus(variant.stock, variant.minimumStock)] += 1;

        return acc;
      },
      { total: 0, summary: emptySummary() }
    );
}
