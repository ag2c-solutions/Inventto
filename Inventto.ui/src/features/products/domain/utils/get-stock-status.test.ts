import { describe, expect, it } from 'vitest';

import { getStockStatus } from './get-stock-status';

describe('getStockStatus', () => {
  it('deve retornar critical quando stockValue é 0', () => {
    expect(getStockStatus(0)).toBe('critical');
  });

  it('deve retornar critical quando stockValue é negativo', () => {
    expect(getStockStatus(-1)).toBe('critical');
  });

  it('deve retornar critical quando stockValue é igual ao minimumStock', () => {
    expect(getStockStatus(10, 10)).toBe('critical');
  });

  it('deve retornar critical quando stockValue é menor que o minimumStock', () => {
    expect(getStockStatus(5, 10)).toBe('critical');
  });

  it('deve retornar warning quando stockValue está entre minimumStock e minimumStock * 1.25 (exclusive)', () => {
    expect(getStockStatus(11, 10)).toBe('warning');
  });

  it('deve retornar healthy quando stockValue é maior que minimumStock * 1.25', () => {
    expect(getStockStatus(20, 10)).toBe('healthy');
  });

  it('deve retornar healthy quando minimumStock é undefined e stockValue é positivo', () => {
    expect(getStockStatus(5)).toBe('healthy');
  });

  it('deve retornar critical quando minimumStock é undefined e stockValue é 0', () => {
    expect(getStockStatus(0, undefined)).toBe('critical');
  });
});
