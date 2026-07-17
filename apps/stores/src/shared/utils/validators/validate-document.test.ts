import { describe, expect, it } from 'vitest';

import { validateDocument } from './validate-document';

describe('validateDocument — CPF (11 dígitos ou menos)', () => {
  it('deve retornar true para um CPF matematicamente válido', () => {
    expect(validateDocument('529.982.247-25')).toBe(true);
  });

  it('deve retornar false para um CPF com todos os dígitos iguais', () => {
    expect(validateDocument('111.111.111-11')).toBe(false);
  });

  it('deve retornar false para um CPF com dígito verificador incorreto', () => {
    expect(validateDocument('529.982.247-26')).toBe(false);
  });

  it('deve retornar false para uma string com menos de 11 dígitos', () => {
    expect(validateDocument('12345678')).toBe(false);
  });
});

describe('validateDocument — CNPJ (mais de 11 dígitos)', () => {
  it('deve retornar true para um CNPJ matematicamente válido', () => {
    expect(validateDocument('11.222.333/0001-81')).toBe(true);
  });

  it('deve retornar false para um CNPJ com todos os dígitos iguais', () => {
    expect(validateDocument('11.111.111/1111-11')).toBe(false);
  });

  it('deve retornar false para um CNPJ com dígito verificador incorreto', () => {
    expect(validateDocument('11.222.333/0001-82')).toBe(false);
  });

  it('deve retornar false para uma string com menos de 14 dígitos', () => {
    expect(validateDocument('112223330001')).toBe(false);
  });
});

describe('validateDocument — delegação e normalização', () => {
  it('deve delegar para a validação de CPF quando a entrada tiver 11 dígitos ou menos', () => {
    expect(validateDocument('52998224725')).toBe(true);
  });

  it('deve delegar para a validação de CNPJ quando a entrada tiver mais de 11 dígitos', () => {
    expect(validateDocument('11222333000181')).toBe(true);
  });

  it('deve aceitar entradas formatadas com pontos, traços e barras, normalizando antes de validar', () => {
    expect(validateDocument('529.982.247-25')).toBe(true);
    expect(validateDocument('11.222.333/0001-81')).toBe(true);
  });
});
