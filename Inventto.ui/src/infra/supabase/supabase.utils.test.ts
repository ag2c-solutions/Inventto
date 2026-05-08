import { describe, expect, it } from 'vitest';

import { isPostgrestError } from './supabase.utils';

describe('isPostgrestError', () => {
  it('deve retornar true para um objeto com as propriedades code, message e details', () => {
    const error = {
      code: '23505',
      message: 'duplicate key',
      details: 'Key already exists'
    };

    expect(isPostgrestError(error)).toBe(true);
  });

  it('deve retornar false para null', () => {
    expect(isPostgrestError(null)).toBe(false);
  });

  it('deve retornar false para um objeto que tenha apenas algumas das propriedades esperadas mas não todas', () => {
    expect(isPostgrestError({ code: '23505', message: 'error' })).toBe(false);
    expect(
      isPostgrestError({ message: 'error', details: 'some details' })
    ).toBe(false);
    expect(isPostgrestError({ code: '23505', details: 'some details' })).toBe(
      false
    );
  });

  it('deve retornar false para tipos primitivos como string, number e boolean', () => {
    expect(isPostgrestError('error string')).toBe(false);
    expect(isPostgrestError(42)).toBe(false);
    expect(isPostgrestError(true)).toBe(false);
  });

  it('deve retornar false para um Error comum do JavaScript, que tem message mas não tem code nem details', () => {
    expect(isPostgrestError(new Error('something went wrong'))).toBe(false);
  });
});
