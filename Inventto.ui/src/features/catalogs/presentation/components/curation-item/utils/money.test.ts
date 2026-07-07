import { describe, expect, it } from 'vitest';

import { formatMoneyInput, parseMoneyInput } from './money';

describe('parseMoneyInput', () => {
  it('should parse digits as cents', () => {
    expect(parseMoneyInput('1234')).toBe(12.34);
  });

  it('should strip non-digit characters before parsing', () => {
    expect(parseMoneyInput('R$ 12,34')).toBe(12.34);
  });

  it('should return 0 for empty input', () => {
    expect(parseMoneyInput('')).toBe(0);
  });
});

describe('formatMoneyInput', () => {
  it('should format a number using pt-BR decimal separators', () => {
    expect(formatMoneyInput(12.34)).toBe('12,34');
  });

  it('should return an empty string for undefined or zero', () => {
    expect(formatMoneyInput(undefined)).toBe('');
    expect(formatMoneyInput(0)).toBe('');
  });
});
