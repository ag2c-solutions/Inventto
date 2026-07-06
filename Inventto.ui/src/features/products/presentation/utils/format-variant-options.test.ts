import { describe, expect, it } from 'vitest';

import { variantOptionFactory } from '../../tests/factories/product.factory';

import { formatVariantOptions } from './format-variant-options';

describe('formatVariantOptions', () => {
  it('should format a single option as "name: value"', () => {
    const options = [
      variantOptionFactory.build({ name: 'Cor', value: 'Azul' })
    ];

    expect(formatVariantOptions(options)).toBe('Cor: Azul');
  });

  it('should join multiple options with " / "', () => {
    const options = [
      variantOptionFactory.build({ name: 'Cor', value: 'Azul' }),
      variantOptionFactory.build({ name: 'Tamanho', value: 'M' })
    ];

    expect(formatVariantOptions(options)).toBe('Cor: Azul / Tamanho: M');
  });

  it('should return an empty string when there are no options', () => {
    expect(formatVariantOptions([])).toBe('');
  });
});
