import { describe, expect, it } from 'vitest';

import {
  DISCOUNT_EXCEEDS_REFERENCE_MESSAGE,
  DISCOUNT_NEGATIVE_MESSAGE,
  DISCOUNT_OVER_100_PERCENT_MESSAGE,
  percentToAmount,
  validateDiscount
} from './index';

describe('validateDiscount', () => {
  it('should reject a negative amount discount', () => {
    const result = validateDiscount({
      mode: 'amount',
      value: -100,
      referencePrice: 5000
    });

    expect(result).toEqual({
      valid: false,
      message: DISCOUNT_NEGATIVE_MESSAGE
    });
  });

  it('should reject a negative percent discount', () => {
    const result = validateDiscount({
      mode: 'percent',
      value: -1,
      referencePrice: 5000
    });

    expect(result.valid).toBe(false);
    expect(result.message).toBe(DISCOUNT_NEGATIVE_MESSAGE);
  });

  it('should reject an amount discount greater than the reference price', () => {
    const result = validateDiscount({
      mode: 'amount',
      value: 5001,
      referencePrice: 5000
    });

    expect(result).toEqual({
      valid: false,
      message: DISCOUNT_EXCEEDS_REFERENCE_MESSAGE
    });
  });

  it('should accept an amount discount equal to the reference price', () => {
    const result = validateDiscount({
      mode: 'amount',
      value: 5000,
      referencePrice: 5000
    });

    expect(result).toEqual({ valid: true });
  });

  it('should reject a percent discount above 100', () => {
    const result = validateDiscount({
      mode: 'percent',
      value: 101,
      referencePrice: 5000
    });

    expect(result).toEqual({
      valid: false,
      message: DISCOUNT_OVER_100_PERCENT_MESSAGE
    });
  });

  it('should accept a percent discount of exactly 100', () => {
    const result = validateDiscount({
      mode: 'percent',
      value: 100,
      referencePrice: 5000
    });

    expect(result).toEqual({ valid: true });
  });

  it('should accept a valid amount discount below the reference price', () => {
    const result = validateDiscount({
      mode: 'amount',
      value: 1000,
      referencePrice: 5000
    });

    expect(result).toEqual({ valid: true });
  });
});

describe('percentToAmount', () => {
  it('should convert a percent discount to cents', () => {
    expect(percentToAmount(10000, 10)).toBe(1000);
  });

  it('should round to the nearest cent', () => {
    expect(percentToAmount(999, 33)).toBe(330);
  });

  it('should return 0 for a 0% discount', () => {
    expect(percentToAmount(10000, 0)).toBe(0);
  });
});
