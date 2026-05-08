import { describe, expect, it } from 'vitest';

import { stripUndefined } from './strip-undefined';

describe('stripUndefined', () => {
  it('deve remover todas as chaves cujo valor é undefined', () => {
    const result = stripUndefined({ a: 1, b: undefined, c: 'hello' });

    expect(result).toEqual({ a: 1, c: 'hello' });
    expect('b' in result).toBe(false);
  });

  it('deve preservar chaves cujo valor é null, 0, false ou string vazia', () => {
    const result = stripUndefined({
      a: null,
      b: 0,
      c: false,
      d: ''
    });

    expect(result).toEqual({ a: null, b: 0, c: false, d: '' });
  });

  it('deve retornar um objeto vazio quando todas as chaves forem undefined', () => {
    const result = stripUndefined({ a: undefined, b: undefined });

    expect(result).toEqual({});
  });

  it('deve retornar o objeto original sem mutação quando nenhuma chave for undefined', () => {
    const input = { a: 1, b: 'hello', c: true };
    const result = stripUndefined(input);

    expect(result).toEqual(input);
  });
});
