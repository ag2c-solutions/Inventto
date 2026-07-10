import { PdvApi } from '../../data/api';
import { type DiscountMode, percentToAmount } from '../validators';

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
}
