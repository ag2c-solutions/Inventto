import { useEffect, useState } from 'react';

import type { CartItem, PdvProduct } from '../../../../domain/entities';
import { PdvCartService } from '../../../../domain/services';
import {
  type DiscountMode,
  validateDiscount
} from '../../../../domain/validators';
import { useCartStore } from '../../../stores/cart-store';

// Ajuda a decidir o helper "Apenas N disponíveis." (RN055/RN070).
const LOW_BALANCE_THRESHOLD = 5;

export function useAddProductDialog(product: PdvProduct | null) {
  const [qty, setQty] = useState(1);
  const [discountOn, setDiscountOn] = useState(false);
  const [discountMode, setDiscountMode] = useState<DiscountMode>('amount');
  const [discountValue, setDiscountValue] = useState(0);

  const addItem = useCartStore((state) => state.addItem);
  const alreadyInCart = useCartStore((state) => {
    if (!product) return 0;

    const existing = state.items.find(
      (item) =>
        item.productId === product.productId &&
        item.variantId === product.variantId
    );

    return existing?.quantity ?? 0;
  });

  // Reseta o formulário sempre que o Dialog abre para um produto diferente.
  useEffect(() => {
    setQty(1);
    setDiscountOn(false);
    setDiscountMode('amount');
    setDiscountValue(0);
  }, [product?.productId, product?.variantId]);

  const referencePrice = product?.price ?? 0;
  // Saldo já considera o que este produto/variante já tem no carrinho —
  // reabrir o Dialog para um item existente não permite exceder o estoque.
  const available = product ? Math.max(product.stock - alreadyInCart, 0) : 0;

  const atMin = qty <= 1;
  const atMax = qty >= available;
  const lowBalance = available < LOW_BALANCE_THRESHOLD || atMax;

  const validation = discountOn
    ? validateDiscount({
        mode: discountMode,
        value: discountValue,
        referencePrice
      })
    : { valid: true as const };

  const invalid = discountOn && !validation.valid;

  const pricing = PdvCartService.computeItemPricing({
    referencePrice,
    qty,
    discount: discountOn ? { mode: discountMode, value: discountValue } : null
  });

  function increment() {
    if (!atMax) setQty((current) => current + 1);
  }

  function decrement() {
    if (!atMin) setQty((current) => current - 1);
  }

  function confirm() {
    if (!product || invalid || available <= 0) return;

    const item: CartItem = {
      productId: product.productId,
      variantId: product.variantId,
      name: product.name,
      variantLabel: product.variantLabel,
      sku: product.sku,
      imageUrl: product.imageUrl,
      unitPrice: referencePrice,
      discount: pricing.discountAmount,
      quantity: qty
    };

    addItem(item);
  }

  return {
    qty,
    increment,
    decrement,
    atMin,
    atMax,
    available,
    lowBalance,
    discountOn,
    setDiscountOn,
    discountMode,
    setDiscountMode,
    discountValue,
    setDiscountValue,
    pricing,
    invalid,
    validationMessage: validation.message,
    confirm
  };
}
