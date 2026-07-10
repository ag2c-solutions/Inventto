export type DiscountMode = 'amount' | 'percent';

export interface DiscountValidationInput {
  mode: DiscountMode;
  // Em centavos quando mode === 'amount'; inteiro 0-100 quando mode === 'percent'.
  value: number;
  // Preço de referência, em centavos.
  referencePrice: number;
}

export interface DiscountValidationResult {
  valid: boolean;
  message?: string;
}

export const DISCOUNT_NEGATIVE_MESSAGE = 'O desconto não pode ser negativo.';
export const DISCOUNT_OVER_100_PERCENT_MESSAGE =
  'O desconto não pode ser maior que 100%.';
export const DISCOUNT_EXCEEDS_REFERENCE_MESSAGE =
  'O desconto não pode ser maior que o preço de referência.';

// RN069: desconto por item, opcional. Cap no piso 0 — não confundir com
// limite de valor por papel (RN069 não impõe teto de valor na v1).
export function validateDiscount({
  mode,
  value,
  referencePrice
}: DiscountValidationInput): DiscountValidationResult {
  if (value < 0) {
    return { valid: false, message: DISCOUNT_NEGATIVE_MESSAGE };
  }

  if (mode === 'percent') {
    if (value > 100) {
      return { valid: false, message: DISCOUNT_OVER_100_PERCENT_MESSAGE };
    }
    return { valid: true };
  }

  if (value > referencePrice) {
    return { valid: false, message: DISCOUNT_EXCEEDS_REFERENCE_MESSAGE };
  }

  return { valid: true };
}

export function percentToAmount(
  referencePrice: number,
  percent: number
): number {
  return Math.round(referencePrice * (percent / 100));
}
