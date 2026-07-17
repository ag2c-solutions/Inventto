import { describe, expect, it } from 'vitest';

import { parseVariantValues } from './parse-variant-values';

describe('parseVariantValues', () => {
  describe('formato padrão com rótulo de atributo (Atributo: valor)', () => {
    it('extrai o valor de cor (com #) de um único atributo', () => {
      const result = parseVariantValues('Cor: White|#FFFFFF');
      expect(result).toEqual(['White|#FFFFFF']);
    });

    it('extrai o valor de texto de um único atributo', () => {
      const result = parseVariantValues('Tamanho: S');
      expect(result).toEqual(['S']);
    });

    it('extrai múltiplos atributos separados por /', () => {
      const result = parseVariantValues('Cor: White|#FFFFFF / Tamanho: S');
      expect(result).toEqual(['White|#FFFFFF', 'S']);
    });

    it('extrai três atributos', () => {
      const result = parseVariantValues(
        'Cor: Red|#FF0000 / Tamanho: M / Material: Algodão'
      );
      expect(result).toEqual(['Red|#FF0000', 'M', 'Algodão']);
    });

    it('remove espaços extras ao redor dos valores', () => {
      const result = parseVariantValues(
        'Cor:  Azul|#0000FF  /  Tamanho:  XL  '
      );
      expect(result).toEqual(['Azul|#0000FF', 'XL']);
    });
  });

  describe('segmentos sem rótulo de atributo (sem dois-pontos)', () => {
    it('retorna o segmento inteiro quando não há dois-pontos', () => {
      const result = parseVariantValues('White|#FFFFFF');
      expect(result).toEqual(['White|#FFFFFF']);
    });

    it('mistura segmentos com e sem rótulo', () => {
      const result = parseVariantValues('Cor: Black|#000000 / S');
      expect(result).toEqual(['Black|#000000', 'S']);
    });
  });

  describe('casos com dois-pontos dentro do valor (ex: URLs ou hex com prefixo)', () => {
    it('usa apenas o primeiro dois-pontos como separador de rótulo', () => {
      const result = parseVariantValues('Cor: rgb(0:0:255)');
      expect(result).toEqual(['rgb(0:0:255)']);
    });
  });

  describe('strings vazias e segmentos inválidos', () => {
    it('retorna array vazio para string vazia', () => {
      const result = parseVariantValues('');
      expect(result).toEqual([]);
    });

    it('ignora segmentos que resultam em string vazia após trim', () => {
      const result = parseVariantValues('Cor: White|#FFFFFF /   / Tamanho: G');
      expect(result).toEqual(['White|#FFFFFF', 'G']);
    });

    it('retorna array vazio quando todos os segmentos são vazios', () => {
      const result = parseVariantValues('   /   /   ');
      expect(result).toEqual([]);
    });
  });
});
