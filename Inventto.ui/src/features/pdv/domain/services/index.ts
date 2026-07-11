import { PdvApi } from '../../data/api';
import type { CartItem, ConfirmSaleInput, PdvProduct } from '../entities';
import {
  type DiscountMode,
  paymentGuardValidator,
  percentToAmount,
  saleGuardValidator
} from '../validators';

export class PdvService {
  static async setPdvCatalog(catalogId: string): Promise<void> {
    if (!catalogId) {
      throw new Error('Selecione um catálogo para vincular ao PDV.');
    }

    return PdvApi.setPdvCatalog(catalogId);
  }
}

export interface ItemDiscountInput {
  mode: DiscountMode;
  // Em centavos quando mode === 'amount'; inteiro 0-100 quando mode === 'percent'.
  value: number;
}

export interface ItemPricingParams {
  // Em centavos.
  referencePrice: number;
  qty: number;
  discount?: ItemDiscountInput | null;
}

export interface ItemPricing {
  discountAmount: number;
  unitFinalPrice: number;
  lineSubtotal: number;
}

export class PdvCartService {
  // RN069: matemática de preço por item do carrinho. Desconto sempre
  // arredondado ao centavo e limitado entre 0 e o preço de referência.
  static computeItemPricing({
    referencePrice,
    qty,
    discount
  }: ItemPricingParams): ItemPricing {
    const rawDiscountAmount = discount
      ? discount.mode === 'percent'
        ? percentToAmount(referencePrice, discount.value)
        : Math.round(discount.value)
      : 0;

    const discountAmount = Math.min(
      Math.max(rawDiscountAmount, 0),
      referencePrice
    );
    const unitFinalPrice = referencePrice - discountAmount;

    return {
      discountAmount,
      unitFinalPrice,
      lineSubtotal: unitFinalPrice * qty
    };
  }

  // Saldo atual do catálogo para a linha do carrinho (produto/variante). Sem
  // correspondência (produto saiu do catálogo) não bloqueia a confirmação —
  // devolve a própria quantidade do carrinho.
  static getAvailableStock(item: CartItem, products: PdvProduct[]): number {
    const product = products.find(
      (p) => p.productId === item.productId && p.variantId === item.variantId
    );

    return product ? product.stock : item.quantity;
  }

  // RN055/RN066: true quando algum item do carrinho excede o saldo atual —
  // usado para desabilitar "Confirmar venda" (PDV-03).
  static hasStockIssue(items: CartItem[], products: PdvProduct[]): boolean {
    return items.some(
      (item) => item.quantity > PdvCartService.getAvailableStock(item, products)
    );
  }
}

export class PdvSaleService {
  // RN055/RN066/RN069: valida o carrinho (não vazio, saldo, desconto) e o
  // pagamento (forma escolhida; dinheiro cobre o total) antes de montar o
  // payload e chamar a API — service protege o domínio, não faz HTTP direto
  // nem mapper manual. Se houver comprovante (cartão/Pix), o upload roda
  // aqui — antes da RPC — e não a RPC diretamente com o arquivo.
  static async confirm(
    input: ConfirmSaleInput,
    proofFile?: File
  ): Promise<string> {
    const cartGuard = saleGuardValidator(
      input.items.map((item) => ({
        quantity: item.quantity,
        availableStock: item.availableStock,
        referencePrice: item.referencePrice,
        discountAmount: item.discountAmount
      }))
    );

    if (!cartGuard.valid) {
      throw new Error(cartGuard.message);
    }

    const total = input.items.reduce(
      (sum, item) =>
        sum + (item.referencePrice - item.discountAmount) * item.quantity,
      0
    );

    const paymentGuard = paymentGuardValidator({
      paymentMethod: input.paymentMethod,
      amountPaid: input.amountPaid,
      total
    });

    if (!paymentGuard.valid) {
      throw new Error(paymentGuard.message);
    }

    const paymentProofUrl = proofFile
      ? await PdvApi.uploadPaymentProof(proofFile)
      : input.paymentProofUrl;

    return PdvApi.createPosSale({ ...input, paymentProofUrl });
  }
}
