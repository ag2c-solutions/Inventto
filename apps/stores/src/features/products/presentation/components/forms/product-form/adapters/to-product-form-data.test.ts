import { describe, expect, it } from 'vitest';

import {
  productFactory,
  productWithVariantsFactory
} from '../../../../../tests/factories/product.factory';

import { toProductFormData } from './to-product-form-data';

describe('toProductFormData', () => {
  it('should map a domain product without variants to form data', () => {
    const product = productFactory.build({
      name: 'Camiseta',
      hasVariants: false,
      variants: []
    });

    const result = toProductFormData(product);

    expect(result.name).toBe('Camiseta');
    expect(result.hasVariants).toBe(false);
  });

  it('should fallback the description to an empty string when absent', () => {
    const product = productFactory.build({ description: undefined });

    const result = toProductFormData(product);

    expect(result.description).toBe('');
  });

  it('should map a domain product with variants including attributes and variants', () => {
    const product = productWithVariantsFactory.build();

    const result = toProductFormData(product);

    expect(result.hasVariants).toBe(true);
    if (result.hasVariants) {
      expect(result.attributes).toHaveLength(product.attributes.length);
      expect(result.variants).toHaveLength(product.variants.length);
      expect(result.variants[0].sku).toBe(product.variants[0].sku);
    }
  });

  it('should fallback variant image isPrimary to false when absent', () => {
    const product = productWithVariantsFactory.build({
      variants: [
        {
          id: 'v-1',
          sku: 'SKU-1',
          stock: 1,
          minimumStock: 0,
          isActive: true,
          options: [{ name: 'Cor', value: 'Azul' }],
          images: [{ id: 'img-1', isPrimary: undefined }]
        }
      ]
    });

    const result = toProductFormData(product);

    if (result.hasVariants) {
      expect(result.variants[0].images[0].isPrimary).toBe(false);
    }
  });
});
