import { describe, expect, it } from 'vitest';

import { resolveProductFormAttributes } from './resolve-product-form-attributes';

describe('resolveProductFormAttributes', () => {
  it('should return an empty array when no attributes are provided', () => {
    expect(resolveProductFormAttributes(undefined)).toEqual([]);
  });

  it('should keep the provided id, slug and type when present', () => {
    const result = resolveProductFormAttributes([
      {
        id: 'attr-1',
        name: 'Cor',
        slug: 'cor',
        type: 'color',
        values: ['Azul']
      }
    ]);

    expect(result).toEqual([
      {
        id: 'attr-1',
        name: 'Cor',
        slug: 'cor',
        type: 'color',
        values: ['Azul']
      }
    ]);
  });

  it('should generate id and slug from name when absent', () => {
    const result = resolveProductFormAttributes([
      {
        name: 'Tamanho Grande',
        values: ['P', 'M'],
        isNew: true
      } as never
    ]);

    expect(result[0].id).toBe('tamanho-grande');
    expect(result[0].slug).toBe('tamanho-grande');
  });

  it('should default type to "text" when absent', () => {
    const result = resolveProductFormAttributes([
      { name: 'Cor', values: ['Azul'] } as never
    ]);

    expect(result[0].type).toBe('text');
  });
});
