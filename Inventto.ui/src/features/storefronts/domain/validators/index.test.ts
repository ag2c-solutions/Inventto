import { describe, expect, it } from 'vitest';

import { removeConfirmationValidator } from './index';

describe('removeConfirmationValidator', () => {
  it('should return true when the confirmation matches the name exactly', () => {
    expect(
      removeConfirmationValidator(
        'Vitrine Ateliê Joana',
        'Vitrine Ateliê Joana'
      )
    ).toBe(true);
  });

  it('should tolerate surrounding whitespace', () => {
    expect(
      removeConfirmationValidator(
        '  Vitrine Ateliê Joana  ',
        'Vitrine Ateliê Joana'
      )
    ).toBe(true);
  });

  it('should return false for a case-insensitive match', () => {
    expect(
      removeConfirmationValidator(
        'vitrine ateliê joana',
        'Vitrine Ateliê Joana'
      )
    ).toBe(false);
  });

  it('should return false when the confirmation is empty', () => {
    expect(removeConfirmationValidator('', 'Vitrine Ateliê Joana')).toBe(false);
  });

  it('should return false for a partial match', () => {
    expect(
      removeConfirmationValidator('Vitrine Ateliê', 'Vitrine Ateliê Joana')
    ).toBe(false);
  });
});
