import type { PaymentMethod } from '../entities';

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

export interface SaleGuardLine {
  quantity: number;
  availableStock: number;
  // Preço de referência e desconto por unidade, em centavos.
  referencePrice: number;
  discountAmount: number;
}

export interface SaleGuardResult {
  valid: boolean;
  message?: string;
}

export const CART_EMPTY_MESSAGE = 'Adicione produtos para iniciar a venda.';
export const STOCK_INSUFFICIENT_MESSAGE =
  'Um ou mais itens excedem o estoque disponível.';
export const CART_DISCOUNT_INVALID_MESSAGE =
  'Um ou mais itens têm desconto inválido.';

// RN055/RN066/RN069: carrinho só é confirmável se não estiver vazio, nenhum
// item exceder o saldo disponível, e nenhum desconto for inválido (defesa
// em profundidade — o Dialog PDV-02 já impede desconto inválido de entrar
// no carrinho, mas o guard revalida no momento da confirmação).
export function saleGuardValidator(lines: SaleGuardLine[]): SaleGuardResult {
  if (lines.length === 0) {
    return { valid: false, message: CART_EMPTY_MESSAGE };
  }

  const hasStockIssue = lines.some(
    (line) => line.quantity > line.availableStock
  );
  if (hasStockIssue) {
    return { valid: false, message: STOCK_INSUFFICIENT_MESSAGE };
  }

  const hasInvalidDiscount = lines.some(
    (line) =>
      line.discountAmount < 0 || line.discountAmount > line.referencePrice
  );
  if (hasInvalidDiscount) {
    return { valid: false, message: CART_DISCOUNT_INVALID_MESSAGE };
  }

  return { valid: true };
}

export interface PaymentGuardInput {
  paymentMethod: PaymentMethod | null;
  // Em centavos.
  amountPaid?: number;
  total: number;
}

export const PAYMENT_METHOD_REQUIRED_MESSAGE =
  'Selecione a forma de pagamento.';
export const AMOUNT_PAID_INSUFFICIENT_MESSAGE =
  'O valor recebido é menor que o total da venda.';

// Forma de pagamento é obrigatória; em dinheiro, o valor recebido precisa
// cobrir o total (troco é derivado, não validado aqui). Cartão/Pix não têm
// requisito além da escolha do método — o comprovante é opcional.
export function paymentGuardValidator({
  paymentMethod,
  amountPaid,
  total
}: PaymentGuardInput): SaleGuardResult {
  if (!paymentMethod) {
    return { valid: false, message: PAYMENT_METHOD_REQUIRED_MESSAGE };
  }

  if (paymentMethod === 'cash' && (amountPaid ?? 0) < total) {
    return { valid: false, message: AMOUNT_PAID_INSUFFICIENT_MESSAGE };
  }

  return { valid: true };
}
