import { describe, expect, it } from 'vitest';

import { formatMoneyInput, parseMoneyInput } from './format-money';

describe('parseMoneyInput', () => {
  it('treats typed digits as cents', () => {
    expect(parseMoneyInput('6103')).toBe(61.03);
    expect(parseMoneyInput('5')).toBe(0.05);
  });

  it('strips non-digit characters (mask punctuation)', () => {
    expect(parseMoneyInput('R$ 61,03')).toBe(61.03);
    expect(parseMoneyInput('1.234,56')).toBe(1234.56);
  });

  it('returns 0 for empty or non-numeric input', () => {
    expect(parseMoneyInput('')).toBe(0);
    expect(parseMoneyInput('R$')).toBe(0);
  });
});

describe('formatMoneyInput', () => {
  it('formats a number as a pt-BR decimal string', () => {
    expect(formatMoneyInput(61.03)).toBe('61,03');
    expect(formatMoneyInput(1234.5)).toBe('1.234,50');
    expect(formatMoneyInput(0.05)).toBe('0,05');
  });

  it('returns an empty string when value is undefined (untouched field)', () => {
    expect(formatMoneyInput(undefined)).toBe('');
  });

  it('round-trips with parseMoneyInput', () => {
    const typed = parseMoneyInput('6103');
    expect(formatMoneyInput(typed)).toBe('61,03');
  });
});
