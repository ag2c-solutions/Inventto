import { describe, expect, it } from 'vitest';

import { getEmptyProductFormValues } from './get-empty-product-form-values';

describe('getEmptyProductFormValues', () => {
  it('should return a blank simple-product form data shape', () => {
    expect(getEmptyProductFormValues()).toEqual({
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
});
