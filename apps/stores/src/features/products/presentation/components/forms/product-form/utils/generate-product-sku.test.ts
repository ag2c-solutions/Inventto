import { describe, expect, it } from 'vitest';

import { generateProductSku } from './generate-product-sku';

describe('generateProductSku', () => {
  it('should build a sku from the first letters of each word', () => {
    expect(generateProductSku('Camiseta Básica Azul')).toBe('CAM-BÁS-AZU');
  });

  it('should uppercase a single word name', () => {
    expect(generateProductSku('tenis')).toBe('TEN');
  });

  it('should collapse extra whitespace between words', () => {
    expect(generateProductSku('  Camiseta   Azul  ')).toBe('CAM-AZU');
  });
});
