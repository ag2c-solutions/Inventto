import { describe, expect, it } from 'vitest';

import { generateAttributeSlug } from './generate-attribute-slug';

describe('generateAttributeSlug', () => {
  it('should lowercase and hyphenate spaces', () => {
    expect(generateAttributeSlug('Tamanho Grande')).toBe('tamanho-grande');
  });

  it('should strip accents', () => {
    expect(generateAttributeSlug('Cor Padrão')).toBe('cor-padrao');
  });

  it('should remove non-word characters', () => {
    expect(generateAttributeSlug('Cor #1!')).toBe('cor-1');
  });

  it('should collapse multiple hyphens and trim leading/trailing ones', () => {
    expect(generateAttributeSlug('  --Cor--  Tamanho--  ')).toBe('cor-tamanho');
  });
});
