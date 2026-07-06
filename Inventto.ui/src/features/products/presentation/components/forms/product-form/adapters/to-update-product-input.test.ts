import { describe, expect, it, vi } from 'vitest';

import { productFormDataFactory } from '../schema/product-form-data.factory';

vi.mock('@/infra/cloudinary', () => ({
  CloudinaryService: {
    uploadImage: vi.fn()
  }
}));

import { toUpdateProductInput } from './to-update-product-input';

describe('toUpdateProductInput', () => {
  it('should map the product form to an UpdateProduct input including its id', async () => {
    const formData = productFormDataFactory.build({ id: 'prod-1' });

    const result = await toUpdateProductInput(formData);

    expect(result.id).toBe('prod-1');
    expect(result.hasVariants).toBe(false);
  });

  it('should fallback to an empty id when the form has none', async () => {
    const formData = productFormDataFactory.build({ id: undefined });

    const result = await toUpdateProductInput(formData);

    expect(result.id).toBe('');
  });
});
