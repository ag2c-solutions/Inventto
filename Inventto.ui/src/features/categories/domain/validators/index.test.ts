import { describe, expect, it } from 'vitest';

import { categorySchema } from '.';

describe('categorySchema', () => {
  it('should accept a valid category name', () => {
    const result = categorySchema.safeParse({ name: 'Eletrônicos' });

    expect(result.success).toBe(true);
  });

  it('should reject an empty name', () => {
    const result = categorySchema.safeParse({ name: '' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      'O nome da categoria é obrigatório.'
    );
  });
});
