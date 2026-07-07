import { describe, expect, it } from 'vitest';

import { catalogItemPriceSchema, catalogSchema } from './index';

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

describe('catalogItemPriceSchema', () => {
  it('should accept a positive price with no original price', () => {
    const result = catalogItemPriceSchema.safeParse({ price: 49.9 });

    expect(result.success).toBe(true);
  });

  it('should accept a positive price with a positive original price', () => {
    const result = catalogItemPriceSchema.safeParse({
      price: 49.9,
      originalPrice: 69.9
    });

    expect(result.success).toBe(true);
  });

  it('should reject a zero or negative price (RN063)', () => {
    const zero = catalogItemPriceSchema.safeParse({ price: 0 });
    const negative = catalogItemPriceSchema.safeParse({ price: -10 });

    expect(zero.success).toBe(false);
    expect(zero.error?.issues[0].message).toBe(
      'Defina um preço para incluir este item.'
    );
    expect(negative.success).toBe(false);
  });

  it('should reject a zero or negative original price when provided', () => {
    const result = catalogItemPriceSchema.safeParse({
      price: 10,
      originalPrice: 0
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'O preço original deve ser maior que zero.'
    );
  });
});
