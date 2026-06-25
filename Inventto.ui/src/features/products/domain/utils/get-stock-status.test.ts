import { describe, expect, it } from 'vitest';

import { getStockStatus } from './get-stock-status';

describe('getStockStatus (RN050)', () => {
  it('deve retornar zeroed quando stockValue é 0', () => {
    expect(getStockStatus(0, 5)).toBe('zeroed');
  });

  it('deve retornar zeroed quando stockValue é negativo', () => {
    expect(getStockStatus(-1, 5)).toBe('zeroed');
  });

  it('deve retornar critical quando stockValue é igual ao minimumStock (> 0)', () => {
    expect(getStockStatus(10, 10)).toBe('critical');
  });

  it('deve retornar critical quando stockValue é menor que o minimumStock', () => {
    expect(getStockStatus(5, 10)).toBe('critical');
  });

  it('deve retornar warning no limite exato de minimumStock * 1.25', () => {
    expect(getStockStatus(12.5, 10)).toBe('warning');
  });

  it('deve retornar warning quando stockValue está entre minimumStock e minimumStock * 1.25', () => {
    expect(getStockStatus(11, 10)).toBe('warning');
  });

  it('deve retornar healthy quando stockValue é maior que minimumStock * 1.25', () => {
    expect(getStockStatus(20, 10)).toBe('healthy');
  });

  it('deve retornar healthy quando minimumStock é undefined e stockValue é positivo', () => {
    expect(getStockStatus(5)).toBe('healthy');
  });

  it('com minimumStock = 0 só existem zeroed (<= 0) e healthy (> 0)', () => {
    expect(getStockStatus(0, 0)).toBe('zeroed');
    expect(getStockStatus(1, 0)).toBe('healthy');
  });

  it('deve retornar zeroed quando minimumStock é undefined e stockValue é 0', () => {
    expect(getStockStatus(0, undefined)).toBe('zeroed');
  });
});
