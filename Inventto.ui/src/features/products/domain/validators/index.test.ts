import { describe, expect, it } from 'vitest';

import {
  createProductFactory,
  createProductWithVariantsFactory,
  updateProductFactory
} from '../../tests/factories/product.factory';

import { createProductSchema, updateProductSchema } from '.';

describe('createProductSchema', () => {
  it('should accept a valid simple product', () => {
    const result = createProductSchema.safeParse(createProductFactory.build());

    expect(result.success).toBe(true);
  });

  it('should accept a valid product with variants', () => {
    const result = createProductSchema.safeParse(
      createProductWithVariantsFactory.build()
    );

    expect(result.success).toBe(true);
  });

  it('should reject a product without a name', () => {
    const result = createProductSchema.safeParse(
      createProductFactory.build({ name: '' })
    );

    expect(result.success).toBe(false);
  });

  it('should reject a product without categories', () => {
    const result = createProductSchema.safeParse(
      createProductFactory.build({ categories: [] })
    );

    expect(result.success).toBe(false);
  });

  it('should reject a simple product (hasVariants=false) that has variants', () => {
    const invalidProduct = {
      ...createProductFactory.build(),
      hasVariants: false,
      variants: createProductWithVariantsFactory.build().variants
    };

    const result = createProductSchema.safeParse(invalidProduct);

    expect(result.success).toBe(false);
  });

  it('should reject a product with variants but no variants array items', () => {
    const invalidProduct = {
      ...createProductWithVariantsFactory.build(),
      variants: []
    };

    const result = createProductSchema.safeParse(invalidProduct);

    expect(result.success).toBe(false);
  });

  it('should reject negative stock', () => {
    const result = createProductSchema.safeParse(
      createProductFactory.build({ stock: -1 })
    );

    expect(result.success).toBe(false);
  });
});

describe('updateProductSchema', () => {
  it('should accept a valid product update', () => {
    const result = updateProductSchema.safeParse(updateProductFactory.build());

    expect(result.success).toBe(true);
  });

  it('should reject an update without an id', () => {
    const invalidUpdate = { ...updateProductFactory.build(), id: '' };

    const result = updateProductSchema.safeParse(invalidUpdate);

    expect(result.success).toBe(false);
  });
});
