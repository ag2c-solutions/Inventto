import { describe, expect, it } from 'vitest';

import { cancelReasonValidator, ORDER_CANCEL_REASONS } from '.';

describe('cancelReasonValidator', () => {
  it('should reject when no reason is provided', () => {
    expect(cancelReasonValidator(undefined)).toBe(false);
    expect(cancelReasonValidator('')).toBe(false);
  });

  it('should reject a reason outside the allowed set', () => {
    expect(cancelReasonValidator('Motivo qualquer')).toBe(false);
  });

  it.each(ORDER_CANCEL_REASONS)('should accept "%s"', (reason) => {
    expect(cancelReasonValidator(reason)).toBe(true);
  });
});
