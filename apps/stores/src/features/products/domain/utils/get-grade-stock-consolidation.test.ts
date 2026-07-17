import { describe, expect, it } from 'vitest';

import { productVariantFactory } from '../../tests/factories/product.factory';

import { getGradeStockConsolidation } from './get-grade-stock-consolidation';

describe('getGradeStockConsolidation (RN043 + RN050)', () => {
  it('soma o total físico apenas das variantes ativas', () => {
    const result = getGradeStockConsolidation([
      productVariantFactory.build({ stock: 30, minimumStock: 5 }),
      productVariantFactory.build({ stock: 12, minimumStock: 4 }),
      productVariantFactory.build({
        stock: 100,
        minimumStock: 5,
        isActive: false
      })
    ]);

    expect(result.total).toBe(42);
  });

  it('conta as variantes ativas por estado de estoque', () => {
    const result = getGradeStockConsolidation([
      productVariantFactory.build({ stock: 30, minimumStock: 5 }), // healthy
      productVariantFactory.build({ stock: 4, minimumStock: 6 }), // critical
      productVariantFactory.build({ stock: 0, minimumStock: 6 }), // zeroed
      productVariantFactory.build({ stock: 7, minimumStock: 6 }) // warning
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
      productVariantFactory.build({ stock: 30, minimumStock: 5 }),
      productVariantFactory.build({
        stock: 0,
        minimumStock: 6,
        isActive: false
      })
    ]);

    expect(result.summary).toEqual({
      zeroed: 0,
      critical: 0,
      warning: 0,
      healthy: 1
    });
  });
});
