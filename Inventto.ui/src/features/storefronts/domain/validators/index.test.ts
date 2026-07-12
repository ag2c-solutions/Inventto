import { describe, expect, it } from 'vitest';

import {
  isSlugFormatValid,
  MAX_THEME_IMAGE_SIZE_MB,
  removeConfirmationValidator,
  storefrontGeneralSchema,
  storefrontThemeSchema
} from './index';

function buildFile(sizeMB: number, type = 'image/png') {
  const blob = new Blob([new Uint8Array(sizeMB * 1024 * 1024)], { type });
  return new File([blob], 'file.png', { type });
}

describe('removeConfirmationValidator', () => {
  it('should return true when the confirmation matches the name exactly', () => {
    expect(
      removeConfirmationValidator(
        'Vitrine Ateliê Joana',
        'Vitrine Ateliê Joana'
      )
    ).toBe(true);
  });

  it('should tolerate surrounding whitespace', () => {
    expect(
      removeConfirmationValidator(
        '  Vitrine Ateliê Joana  ',
        'Vitrine Ateliê Joana'
      )
    ).toBe(true);
  });

  it('should return false for a case-insensitive match', () => {
    expect(
      removeConfirmationValidator(
        'vitrine ateliê joana',
        'Vitrine Ateliê Joana'
      )
    ).toBe(false);
  });

  it('should return false when the confirmation is empty', () => {
    expect(removeConfirmationValidator('', 'Vitrine Ateliê Joana')).toBe(false);
  });

  it('should return false for a partial match', () => {
    expect(
      removeConfirmationValidator('Vitrine Ateliê', 'Vitrine Ateliê Joana')
    ).toBe(false);
  });
});

describe('isSlugFormatValid', () => {
  it('should accept a valid slug', () => {
    expect(isSlugFormatValid('atelie-joana')).toBe(true);
  });

  it('should reject uppercase letters', () => {
    expect(isSlugFormatValid('Atelie-Joana')).toBe(false);
  });

  it('should reject spaces', () => {
    expect(isSlugFormatValid('atelie joana')).toBe(false);
  });

  it('should reject a leading hyphen', () => {
    expect(isSlugFormatValid('-atelie-joana')).toBe(false);
  });

  it('should reject a trailing hyphen', () => {
    expect(isSlugFormatValid('atelie-joana-')).toBe(false);
  });

  it('should reject shorter than 3 characters', () => {
    expect(isSlugFormatValid('ab')).toBe(false);
  });

  it('should reject longer than 50 characters', () => {
    expect(isSlugFormatValid('a'.repeat(51))).toBe(false);
  });

  it('should accept exactly 3 and 50 characters', () => {
    expect(isSlugFormatValid('abc')).toBe(true);
    expect(isSlugFormatValid('a'.repeat(50))).toBe(true);
  });

  it('should reject reserved words', () => {
    expect(isSlugFormatValid('storefronts')).toBe(false);
    expect(isSlugFormatValid('admin')).toBe(false);
  });
});

describe('storefrontGeneralSchema', () => {
  const base = {
    name: 'Vitrine Ateliê Joana',
    catalogId: undefined,
    slug: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    website: ''
  };

  it('should require a name', () => {
    const result = storefrontGeneralSchema.safeParse({ ...base, name: '' });
    expect(result.success).toBe(false);
  });

  it('should accept an empty slug (draft without address yet)', () => {
    const result = storefrontGeneralSchema.safeParse({ ...base, slug: '' });
    expect(result.success).toBe(true);
  });

  it('should reject an invalid slug format', () => {
    const result = storefrontGeneralSchema.safeParse({
      ...base,
      slug: 'Loja Centro!'
    });
    expect(result.success).toBe(false);
  });

  it('should accept a valid slug', () => {
    const result = storefrontGeneralSchema.safeParse({
      ...base,
      slug: 'atelie-joana'
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional social fields empty', () => {
    const result = storefrontGeneralSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it('should reject an invalid website URL', () => {
    const result = storefrontGeneralSchema.safeParse({
      ...base,
      website: 'not-a-url'
    });
    expect(result.success).toBe(false);
  });

  it('should accept an empty website', () => {
    const result = storefrontGeneralSchema.safeParse({
      ...base,
      website: ''
    });
    expect(result.success).toBe(true);
  });
});

describe('storefrontThemeSchema', () => {
  const baseTheme = {
    colors: {
      primary: '#3A3631',
      background: '#F7F5F2',
      secondary: '#8B857D',
      text: '#2C2A28'
    },
    layout: 'grid' as const,
    cardStyle: 'minimal-large-image' as const
  };

  it('should accept a fully valid theme', () => {
    const result = storefrontThemeSchema.safeParse(baseTheme);
    expect(result.success).toBe(true);
  });

  it('should reject an invalid hex color', () => {
    const result = storefrontThemeSchema.safeParse({
      ...baseTheme,
      colors: { ...baseTheme.colors, primary: 'not-a-hex' }
    });
    expect(result.success).toBe(false);
  });

  it('should accept 3-digit and 6-digit hex colors', () => {
    expect(
      storefrontThemeSchema.safeParse({
        ...baseTheme,
        colors: { ...baseTheme.colors, primary: '#abc' }
      }).success
    ).toBe(true);
    expect(
      storefrontThemeSchema.safeParse({
        ...baseTheme,
        colors: { ...baseTheme.colors, primary: '#aabbcc' }
      }).success
    ).toBe(true);
  });

  it('should reject a layout outside grid/list', () => {
    const result = storefrontThemeSchema.safeParse({
      ...baseTheme,
      layout: 'carousel'
    });
    expect(result.success).toBe(false);
  });

  it('should reject a cardStyle outside the allowed set', () => {
    const result = storefrontThemeSchema.safeParse({
      ...baseTheme,
      cardStyle: 'unknown-style'
    });
    expect(result.success).toBe(false);
  });

  it('should accept a logo/cover file within the size and type limits', () => {
    const result = storefrontThemeSchema.safeParse({
      ...baseTheme,
      logoFile: buildFile(1)
    });
    expect(result.success).toBe(true);
  });

  it('should reject a logo/cover file over the size limit', () => {
    const result = storefrontThemeSchema.safeParse({
      ...baseTheme,
      logoFile: buildFile(MAX_THEME_IMAGE_SIZE_MB + 1)
    });
    expect(result.success).toBe(false);
  });

  it('should reject a file with a disallowed mime type', () => {
    const result = storefrontThemeSchema.safeParse({
      ...baseTheme,
      coverFile: buildFile(1, 'application/pdf')
    });
    expect(result.success).toBe(false);
  });
});
