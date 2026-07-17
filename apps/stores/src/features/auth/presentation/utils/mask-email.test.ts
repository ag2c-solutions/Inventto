import { describe, expect, it } from 'vitest';

import { maskEmail } from './mask-email';

describe('maskEmail', () => {
  it('deve manter o primeiro caractere do local-part e mascarar o resto', () => {
    expect(maskEmail('joana@email.com')).toBe('j•••@email.com');
  });

  it('deve mascarar totalmente o local-part quando ele tem 1 caractere', () => {
    expect(maskEmail('j@email.com')).toBe('•••@email.com');
  });

  it('deve retornar o e-mail original quando não há domínio', () => {
    expect(maskEmail('sem-arroba')).toBe('sem-arroba');
  });

  it('deve preservar o domínio completo', () => {
    expect(maskEmail('rafael@inventto.com.br')).toBe('r•••@inventto.com.br');
  });
});
