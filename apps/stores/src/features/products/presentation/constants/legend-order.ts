import type { ProductStockStatus } from '../../domain/entities';

export const LEGEND_ORDER: ProductStockStatus[] = [
  'healthy',
  'warning',
  'critical',
  'zeroed'
];
