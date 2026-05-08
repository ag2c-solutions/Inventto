import type { ProductStockStatus } from '../entities';

export type StockSummary = Record<ProductStockStatus, number>;
export function getStockSummaryStatus(
  summary: StockSummary
): ProductStockStatus {
  if (summary.critical > 0) return 'critical';
  if (summary.warning > 0) return 'warning';

  return 'healthy';
}
