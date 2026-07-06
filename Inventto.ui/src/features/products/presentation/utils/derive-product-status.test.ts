import { describe, expect, it } from 'vitest';

import {
  productFactory,
  productVariantFactory,
  productWithVariantsFactory
} from '../../tests/factories/product.factory';

import {
  deriveProductStatus,
  getProductTotalStock
} from './derive-product-status';

describe('getProductTotalStock', () => {
  it('should return the product stock for a simple product', () => {
    const product = productFactory.build({ stock: 42 });

    expect(getProductTotalStock(product)).toBe(42);
  });

  it('should return the consolidated grade stock for a product with variants', () => {
    const product = productWithVariantsFactory.build({
      variants: [
        productVariantFactory.build({ stock: 10, isActive: true }),
        productVariantFactory.build({ stock: 5, isActive: true })
      ]
    });

    expect(getProductTotalStock(product)).toBe(15);
  });
});

describe('deriveProductStatus', () => {
  it('should return "inactive" regardless of stock when the product is inactive', () => {
    const product = productFactory.build({
      isActive: false,
      stock: 100,
      minimumStock: 5
    });

    expect(deriveProductStatus(product)).toBe('inactive');
  });

  it('should derive the stock status for a simple active product', () => {
    const product = productFactory.build({
      isActive: true,
      stock: 0,
      minimumStock: 5
    });

    expect(deriveProductStatus(product)).toBe('zeroed');
  });

  it('should derive the worst-case status among variants for a product with variants', () => {
    const product = productWithVariantsFactory.build({
      isActive: true,
      variants: [
        productVariantFactory.build({
          stock: 0,
          minimumStock: 5,
          isActive: true
        }),
        productVariantFactory.build({
          stock: 50,
          minimumStock: 5,
          isActive: true
        })
      ]
    });

    expect(deriveProductStatus(product)).toBe('zeroed');
  });
});
