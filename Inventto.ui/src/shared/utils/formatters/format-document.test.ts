import { describe, expect, it } from 'vitest';

import { formatDocument, normalizeDocument } from './format-document';

describe('normalizeDocument', () => {
  it('deve remover todos os caracteres não numéricos de uma string', () => {
    expect(normalizeDocument('123.456.789-09')).toBe('12345678909');
  });

  it('deve retornar apenas os dígitos quando a entrada já for numérica', () => {
    expect(normalizeDocument('12345678909')).toBe('12345678909');
  });

  it('deve retornar string vazia quando a entrada for vazia', () => {
    expect(normalizeDocument('')).toBe('');
  });
});

describe('formatDocument', () => {
  it('deve formatar corretamente um CPF com 11 dígitos no padrão 000.000.000-00', () => {
    expect(formatDocument('12345678909')).toBe('123.456.789-09');
  });

  it('deve formatar corretamente um CNPJ com 14 dígitos no padrão 00.000.000/0000-00', () => {
    expect(formatDocument('12345678000195')).toBe('12.345.678/0001-95');
  });

  it('deve formatar corretamente strings parciais enquanto o usuário digita, sem quebrar com entradas incompletas', () => {
    expect(formatDocument('123')).toBe('123');
    expect(formatDocument('1234')).toBe('123.4');
    expect(formatDocument('123456')).toBe('123.456');
    expect(formatDocument('1234567')).toBe('123.456.7');
    expect(formatDocument('123456789')).toBe('123.456.789');
    expect(formatDocument('1234567890')).toBe('123.456.789-0');
  });

  it('deve ignorar dígitos além do 14º caractere', () => {
    expect(formatDocument('123456789001234567')).toBe('12.345.678/9001-23');
  });

  it('deve retornar string vazia quando a entrada for vazia', () => {
    expect(formatDocument('')).toBe('');
  });
});
