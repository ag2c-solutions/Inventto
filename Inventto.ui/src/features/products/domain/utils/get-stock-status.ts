import type { ProductStockStatus } from '../entities';

export const getStockStatus = (
  stockValue: number,
  minimumStock?: number
): ProductStockStatus => {
  if (
    stockValue <= 0 ||
    (minimumStock !== undefined && stockValue <= minimumStock)
  ) {
    return 'critical';
  }

  if (minimumStock !== undefined && stockValue <= minimumStock * 1.25) {
    return 'warning';
  }

  return 'healthy';
};
