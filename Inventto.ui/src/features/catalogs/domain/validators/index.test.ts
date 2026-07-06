import { describe, expect, it } from 'vitest';

import { catalogSchema } from './index';

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
