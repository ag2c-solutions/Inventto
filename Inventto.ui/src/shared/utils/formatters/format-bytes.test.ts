import { describe, expect, it } from 'vitest';

import { formatBytes } from './format-bytes';

describe('formatBytes', () => {
  it('deve retornar "0 Bytes" quando o input for zero', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('deve formatar valores em Bytes (menor que 1 KB)', () => {
    expect(formatBytes(500)).toBe('500 Bytes');
  });

  it('deve formatar valores em KB (Kilobytes)', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1500)).toBe('1.46 KB');
    expect(formatBytes(1500, 0)).toBe('1 KB');
  });

  it('deve formatar valores em MB (Megabytes)', () => {
    const megabyte = 1024 * 1024;

    expect(formatBytes(megabyte)).toBe('1 MB');
    expect(formatBytes(megabyte * 1.5)).toBe('1.5 MB');
  });

  it('deve formatar valores em GB (Gigabytes)', () => {
    const gigabyte = 1024 * 1024 * 1024;

    expect(formatBytes(gigabyte * 10.75)).toBe('10.75 GB');
  });

  it('deve respeitar o número de casas decimais informado', () => {
    expect(formatBytes(1025, 3)).toBe('1.001 KB');
  });

  it('deve tratar decimais negativos como zero casas decimais', () => {
    expect(formatBytes(1500, -1)).toBe('1 KB');
  });
});
