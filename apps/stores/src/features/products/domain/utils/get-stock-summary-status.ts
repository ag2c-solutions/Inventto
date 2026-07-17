import type { ProductStockStatus } from '../entities';

export type StockSummary = Record<ProductStockStatus, number>;

/**
 * Status consolidado de uma grade de variações = pior caso da grade.
 * Ordem de severidade (RN050): zerado > crítico > atenção > saudável.
 */
export function getStockSummaryStatus(
  summary: StockSummary
): ProductStockStatus {
  if (summary.zeroed > 0) return 'zeroed';
  if (summary.critical > 0) return 'critical';
  if (summary.warning > 0) return 'warning';

  return 'healthy';
}
