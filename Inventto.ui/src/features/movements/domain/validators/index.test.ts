import { describe, expect, it } from 'vitest';

import { SALE_CANCEL_REASONS, saleCancelReasonValidator } from '.';

describe('saleCancelReasonValidator', () => {
  it('should reject when no reason is provided', () => {
    expect(saleCancelReasonValidator(undefined)).toBe(false);
    expect(saleCancelReasonValidator('')).toBe(false);
  });

  it('should reject a reason outside the allowed set', () => {
    expect(saleCancelReasonValidator('Motivo qualquer')).toBe(false);
  });

  it.each(SALE_CANCEL_REASONS)('should accept "%s"', (reason) => {
    expect(saleCancelReasonValidator(reason)).toBe(true);
  });
});
