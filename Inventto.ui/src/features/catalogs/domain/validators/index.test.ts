import { describe, expect, it } from 'vitest';

import {
  catalogItemInputSchema,
  catalogSchema,
  configurePricesSchema,
  variantPriceInputSchema
} from './index';

describe('catalogSchema', () => {
  it('should accept a valid name', () => {
    const result = catalogSchema.safeParse({ name: 'Catálogo Verão' });

    expect(result.success).toBe(true);
  });

  it('should reject an empty name', () => {
    const result = catalogSchema.safeParse({ name: '' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Informe um nome para o catálogo.'
    );
  });

  it('should reject a name with only whitespace', () => {
    const result = catalogSchema.safeParse({ name: '   ' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Informe um nome para o catálogo.'
    );
  });
});

describe('variantPriceInputSchema', () => {
  it('should accept an excluded variant without a price', () => {
    const result = variantPriceInputSchema.safeParse({
      variantId: 'v1',
      included: false
    });

    expect(result.success).toBe(true);
  });

  it('should accept a positive price in cents', () => {
    const result = variantPriceInputSchema.safeParse({
      variantId: 'v1',
      included: true,
      price: 4990
    });

    expect(result.success).toBe(true);
  });

  it('should reject a zero or negative price when provided', () => {
    const result = variantPriceInputSchema.safeParse({
      variantId: 'v1',
      included: true,
      price: 0
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Defina um preço para esta variante.'
    );
  });

  it('should accept a null original price (promotion cleared)', () => {
    const result = variantPriceInputSchema.safeParse({
      variantId: 'v1',
      included: true,
      price: 4990,
      originalPrice: null
    });

    expect(result.success).toBe(true);
  });

  it('should reject a zero or negative original price when provided', () => {
    const result = variantPriceInputSchema.safeParse({
      variantId: 'v1',
      included: true,
      price: 4990,
      originalPrice: 0
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'O preço original deve ser maior que zero.'
    );
  });
});

describe('catalogItemInputSchema', () => {
  it('should accept a single-price product with no variants', () => {
    const result = catalogItemInputSchema.safeParse({
      productId: 'p1',
      priceMode: 'single',
      price: 8990
    });

    expect(result.success).toBe(true);
  });

  it('should accept a per-variant priced product', () => {
    const result = catalogItemInputSchema.safeParse({
      productId: 'p1',
      priceMode: 'per_variant',
      variants: [
        { variantId: 'v1', included: true, price: 4990 },
        { variantId: 'v2', included: false }
      ]
    });

    expect(result.success).toBe(true);
  });

  it('should reject a zero or negative price when provided', () => {
    const result = catalogItemInputSchema.safeParse({
      productId: 'p1',
      priceMode: 'single',
      price: 0
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Defina um preço de venda.');
  });
});

describe('configurePricesSchema', () => {
  it('should accept a list of valid items', () => {
    const result = configurePricesSchema.safeParse({
      items: [{ productId: 'p1', priceMode: 'single', price: 8990 }]
    });

    expect(result.success).toBe(true);
  });

  it('should accept an empty items list', () => {
    const result = configurePricesSchema.safeParse({ items: [] });

    expect(result.success).toBe(true);
  });
});
