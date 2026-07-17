import { describe, expect, it } from 'vitest';

import { formatToDecimal, formatToInteger } from './format-to-decimal';

describe('formatToDecimal', () => {
  it('should format integer to decimal with default 2 decimal places', () => {
    expect(formatToDecimal(1500)).toBe(15.0);
    expect(formatToDecimal(5)).toBe(0.05);
    expect(formatToDecimal(199)).toBe(1.99);
  });

  it('should format integer to decimal with custom decimal places', () => {
    expect(formatToDecimal(1500, 3)).toBe(1.5);
    expect(formatToDecimal(1500, 0)).toBe(1500);
    expect(formatToDecimal(12345, 4)).toBe(1.2345);
  });

  it('should handle zero correctly', () => {
    expect(formatToDecimal(0)).toBe(0);
    expect(formatToDecimal(0, 3)).toBe(0);
  });

  it('should handle negative numbers correctly', () => {
    expect(formatToDecimal(-1500)).toBe(-15.0);
    expect(formatToDecimal(-5)).toBe(-0.05);
  });
});

describe('formatToInteger', () => {
  it('should format decimal to integer with default 2 decimal places', () => {
    expect(formatToInteger(15)).toBe(1500);
    expect(formatToInteger(0.05)).toBe(5);
    expect(formatToInteger(1.99)).toBe(199);
  });

  it('should round to the nearest integer', () => {
    expect(formatToInteger(15.005)).toBe(1501);
    expect(formatToInteger(15.004)).toBe(1500);
  });

  it('should be the inverse of formatToDecimal', () => {
    expect(formatToInteger(formatToDecimal(1500))).toBe(1500);
  });

  it('should handle zero correctly', () => {
    expect(formatToInteger(0)).toBe(0);
  });

  it('should handle negative numbers correctly', () => {
    expect(formatToInteger(-15)).toBe(-1500);
  });
});
