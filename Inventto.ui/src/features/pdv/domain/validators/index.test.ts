import { describe, expect, it } from 'vitest';

import {
  AMOUNT_PAID_INSUFFICIENT_MESSAGE,
  CART_DISCOUNT_INVALID_MESSAGE,
  CART_EMPTY_MESSAGE,
  DISCOUNT_EXCEEDS_REFERENCE_MESSAGE,
  DISCOUNT_NEGATIVE_MESSAGE,
  DISCOUNT_OVER_100_PERCENT_MESSAGE,
  PAYMENT_METHOD_REQUIRED_MESSAGE,
  paymentGuardValidator,
  percentToAmount,
  type SaleGuardLine,
  saleGuardValidator,
  STOCK_INSUFFICIENT_MESSAGE,
  validateDiscount
} from './index';

function makeLine(overrides: Partial<SaleGuardLine> = {}): SaleGuardLine {
  return {
    quantity: 1,
    availableStock: 10,
    referencePrice: 5000,
    discountAmount: 0,
    ...overrides
  };
}

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

describe('saleGuardValidator', () => {
  it('should reject an empty cart', () => {
    const result = saleGuardValidator([]);

    expect(result).toEqual({ valid: false, message: CART_EMPTY_MESSAGE });
  });

  it('should reject when an item exceeds the available stock', () => {
    const result = saleGuardValidator([
      makeLine({ quantity: 5, availableStock: 3 })
    ]);

    expect(result).toEqual({
      valid: false,
      message: STOCK_INSUFFICIENT_MESSAGE
    });
  });

  it('should reject when a discount exceeds the reference price', () => {
    const result = saleGuardValidator([
      makeLine({ referencePrice: 1000, discountAmount: 1001 })
    ]);

    expect(result).toEqual({
      valid: false,
      message: CART_DISCOUNT_INVALID_MESSAGE
    });
  });

  it('should reject a negative discount', () => {
    const result = saleGuardValidator([makeLine({ discountAmount: -1 })]);

    expect(result).toEqual({
      valid: false,
      message: CART_DISCOUNT_INVALID_MESSAGE
    });
  });

  it('should accept a valid cart', () => {
    const result = saleGuardValidator([
      makeLine({ quantity: 2, availableStock: 5 }),
      makeLine({ referencePrice: 2000, discountAmount: 500 })
    ]);

    expect(result).toEqual({ valid: true });
  });
});

describe('paymentGuardValidator', () => {
  it('should reject when no payment method is selected', () => {
    const result = paymentGuardValidator({
      paymentMethod: null,
      total: 10000
    });

    expect(result).toEqual({
      valid: false,
      message: PAYMENT_METHOD_REQUIRED_MESSAGE
    });
  });

  it('should reject cash when amountPaid is less than the total', () => {
    const result = paymentGuardValidator({
      paymentMethod: 'cash',
      amountPaid: 5000,
      total: 10000
    });

    expect(result).toEqual({
      valid: false,
      message: AMOUNT_PAID_INSUFFICIENT_MESSAGE
    });
  });

  it('should reject cash when amountPaid is absent', () => {
    const result = paymentGuardValidator({
      paymentMethod: 'cash',
      total: 10000
    });

    expect(result.valid).toBe(false);
  });

  it('should accept cash when amountPaid equals the total', () => {
    const result = paymentGuardValidator({
      paymentMethod: 'cash',
      amountPaid: 10000,
      total: 10000
    });

    expect(result).toEqual({ valid: true });
  });

  it('should accept card without an amountPaid', () => {
    const result = paymentGuardValidator({
      paymentMethod: 'card',
      total: 10000
    });

    expect(result).toEqual({ valid: true });
  });

  it('should accept pix without an amountPaid', () => {
    const result = paymentGuardValidator({
      paymentMethod: 'pix',
      total: 10000
    });

    expect(result).toEqual({ valid: true });
  });
});
