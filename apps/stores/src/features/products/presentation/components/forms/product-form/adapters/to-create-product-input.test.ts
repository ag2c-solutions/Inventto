import { describe, expect, it, vi } from 'vitest';

import {
  productFormDataFactory,
  productFormWithVariantsDataFactory
} from '../schema/product-form-data.factory';

vi.mock('@/infra/cloudinary', () => ({
  CloudinaryService: {
    uploadImage: vi.fn()
  }
}));

import { toCreateProductInput } from './to-create-product-input';

describe('toCreateProductInput', () => {
  it('should map a simple product form to a CreateProduct input without variants', async () => {
    const formData = productFormDataFactory.build({ name: 'Camiseta' });

    const result = await toCreateProductInput(formData);

    expect(result.name).toBe('Camiseta');
    expect(result.hasVariants).toBe(false);
    expect(result.variants).toEqual([]);
    expect(result.attributes).toEqual([]);
  });

  it('should map a product form with variants including attributes and variants', async () => {
    const formData = productFormWithVariantsDataFactory.build();

    const result = await toCreateProductInput(formData);

    expect(result.hasVariants).toBe(true);
    expect(result.attributes).toHaveLength(1);
    expect(result.variants).toHaveLength(1);
    expect(result.variants[0]).toMatchObject({
      sku: formData.variants[0].sku,
      stock: formData.variants[0].stock
    });
  });

  it('should not include organizationId in the output', async () => {
    const formData = productFormDataFactory.build();

    const result = await toCreateProductInput(formData);

    expect(result).not.toHaveProperty('organizationId');
  });
});
