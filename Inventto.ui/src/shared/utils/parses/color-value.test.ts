import { describe, expect, it } from 'vitest';

import { parseColorValue } from './color-value';

describe('parseColorValue', () => {
  it('deve retornar name e hex separados quando o valor contiver o separador "|"', () => {
    const result = parseColorValue('Vermelho|#FF0000');

    expect(result).toEqual({ name: 'Vermelho', hex: '#FF0000' });
  });

  it('deve usar o primeiro segmento como name e o segundo como hex', () => {
    const result = parseColorValue('Azul|#0000FF');

    expect(result.name).toBe('Azul');
    expect(result.hex).toBe('#0000FF');
  });

  it('deve retornar o mesmo valor para name e hex quando não houver separador', () => {
    const result = parseColorValue('#FFFFFF');

    expect(result).toEqual({ name: '#FFFFFF', hex: '#FFFFFF' });
  });

  it('deve retornar o mesmo valor para name e hex quando a entrada for uma string simples', () => {
    const result = parseColorValue('verde');

    expect(result).toEqual({ name: 'verde', hex: 'verde' });
  });

  it('deve retornar name e hex vazios quando a entrada for uma string vazia', () => {
    const result = parseColorValue('');

    expect(result).toEqual({ name: '', hex: '' });
  });

  it('deve usar o primeiro segmento como name e o segundo como hex, descartando segmentos adicionais', () => {
    const result = parseColorValue('Nome|#ABC|extra');

    expect(result.name).toBe('Nome');
    expect(result.hex).toBe('#ABC');
  });
});
