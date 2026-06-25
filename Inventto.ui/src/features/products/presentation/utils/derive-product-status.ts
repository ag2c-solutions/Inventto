import type { IProduct } from '../../domain/entities';
import { getGradeStockConsolidation } from '../../domain/utils/get-grade-stock-consolidation';
import { getStockStatus } from '../../domain/utils/get-stock-status';
import { getStockSummaryStatus } from '../../domain/utils/get-stock-summary-status';

/**
 * Status derivado para a coluna/filtro de Status da lista de produtos.
 * Une o estado de ativação (RN045) ao estado de estoque (RN050).
 * "Inativo" tem precedência; nos demais casos vale o estado de estoque,
 * incluindo "Zerado" (saldo físico nulo).
 */
export type ProductDisplayStatus =
  | 'inactive'
  | 'zeroed'
  | 'critical'
  | 'warning'
  | 'healthy';

export function getProductTotalStock(product: IProduct): number {
  if (product.hasVariants && product.variants.length > 0) {
    return getGradeStockConsolidation(product.variants).total;
  }

  return product.stock ?? 0;
}

export function deriveProductStatus(product: IProduct): ProductDisplayStatus {
  if (!product.isActive) {
    return 'inactive';
  }

  if (product.hasVariants && product.variants.length > 0) {
    const { summary } = getGradeStockConsolidation(product.variants);

    return getStockSummaryStatus(summary);
  }

  return getStockStatus(product.stock ?? 0, product.minimumStock);
}
