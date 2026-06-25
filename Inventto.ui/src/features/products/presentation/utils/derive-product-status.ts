import type { IProduct } from '../../domain/entities';
import { getStockStatus } from '../../domain/utils/get-stock-status';
import { getStockSummaryStatus } from '../../domain/utils/get-stock-summary-status';

/**
 * Status derivado para a coluna/filtro de Status da lista de produtos.
 * Une o estado de ativação (RN045) ao estado de estoque (RN050, refinado na
 * PROD-02). "Inativo" tem precedência; "Zerado" representa saldo físico nulo.
 */
export type ProductDisplayStatus =
  | 'inactive'
  | 'zeroed'
  | 'critical'
  | 'warning'
  | 'healthy';

export function getProductTotalStock(product: IProduct): number {
  if (product.hasVariants && product.variants.length > 0) {
    return product.variants.reduce(
      (total, variant) => total + (variant.stock || 0),
      0
    );
  }

  return product.stock ?? 0;
}

export function deriveProductStatus(product: IProduct): ProductDisplayStatus {
  if (!product.isActive) {
    return 'inactive';
  }

  const totalStock = getProductTotalStock(product);

  if (totalStock <= 0) {
    return 'zeroed';
  }

  if (product.hasVariants && product.variants.length > 0) {
    const summary = product.variants.reduce(
      (acc, variant) => {
        acc[getStockStatus(variant.stock, variant.minimumStock)] += 1;

        return acc;
      },
      { critical: 0, warning: 0, healthy: 0 }
    );

    return getStockSummaryStatus(summary);
  }

  return getStockStatus(totalStock, product.minimumStock);
}
