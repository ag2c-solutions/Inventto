import { describe, expect, it } from 'vitest';

import { getEmptyProductFormValues } from './get-empty-product-form-values';
import { getProductFormDefaultValues } from './get-product-form-default-values';

describe('getProductFormDefaultValues', () => {
  it('should return the empty form values when no data is provided', () => {
    expect(getProductFormDefaultValues(undefined)).toEqual(
      getEmptyProductFormValues()
    );
  });

  it('should fill in fallbacks for a simple product with missing fields', () => {
    const result = getProductFormDefaultValues({
      hasVariants: false
    } as never);

    expect(result).toEqual({
      id: '',
      name: '',
      description: '',
      categories: [],
      sku: '',
      minimumStock: 0,
      stock: 0,
      isActive: true,
      allImages: [],
      hasVariants: false
    });
  });

  it('should keep attributes and variants for a product with variants', () => {
    const result = getProductFormDefaultValues({
      id: 'p-1',
      name: 'Camiseta',
      hasVariants: true,
      attributes: [{ name: 'Cor', values: ['Azul'] }],
      variants: [{ sku: 'SKU-1' }]
    } as never);

    expect(result.hasVariants).toBe(true);
    if (result.hasVariants) {
      expect(result.attributes).toEqual([{ name: 'Cor', values: ['Azul'] }]);
      expect(result.variants).toEqual([{ sku: 'SKU-1' }]);
    }
  });

  it('should default attributes and variants to empty arrays when absent', () => {
    const result = getProductFormDefaultValues({
      hasVariants: true
    } as never);

    if (result.hasVariants) {
      expect(result.attributes).toEqual([]);
      expect(result.variants).toEqual([]);
    }
  });
});
