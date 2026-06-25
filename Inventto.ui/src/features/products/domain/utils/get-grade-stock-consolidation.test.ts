import { describe, expect, it } from 'vitest';

import type { IProductVariant } from '../entities';

import { getGradeStockConsolidation } from './get-grade-stock-consolidation';

const makeVariant = (
  overrides: Partial<IProductVariant> & { stock: number }
): IProductVariant => ({
  id: `v-${overrides.sku ?? overrides.stock}`,
  sku: 'SKU',
  minimumStock: 0,
  isActive: true,
  images: [],
  options: [{ name: 'Cor', value: 'Branco' }],
  ...overrides
});

describe('getGradeStockConsolidation (RN043 + RN050)', () => {
  it('soma o total físico apenas das variantes ativas', () => {
    const result = getGradeStockConsolidation([
      makeVariant({ stock: 30, minimumStock: 5 }),
      makeVariant({ stock: 12, minimumStock: 4 }),
      makeVariant({ stock: 100, minimumStock: 5, isActive: false })
    ]);

    expect(result.total).toBe(42);
  });

  it('conta as variantes ativas por estado de estoque', () => {
    const result = getGradeStockConsolidation([
      makeVariant({ stock: 30, minimumStock: 5 }), // healthy
      makeVariant({ stock: 4, minimumStock: 6 }), // critical
      makeVariant({ stock: 0, minimumStock: 6 }), // zeroed
      makeVariant({ stock: 7, minimumStock: 6 }) // warning
    ]);

    expect(result.summary).toEqual({
      zeroed: 1,
      critical: 1,
      warning: 1,
      healthy: 1
    });
  });

  it('ignora variantes inativas também na contagem por estado', () => {
    const result = getGradeStockConsolidation([
      makeVariant({ stock: 30, minimumStock: 5 }),
      makeVariant({ stock: 0, minimumStock: 6, isActive: false })
    ]);

    expect(result.summary).toEqual({
      zeroed: 0,
      critical: 0,
      warning: 0,
      healthy: 1
    });
  });
});
