import { useState } from 'react';

import type { CartItem, SaleCustomerInput } from '../../../../domain/entities';
import { PdvCartService } from '../../../../domain/services';
import { useConfirmPosSaleMutation } from '../../../hooks/use-mutations';
import {
  usePdvCatalogQuery,
  usePdvProductsQuery
} from '../../../hooks/use-queries';
import {
  selectCartDiscountTotal,
  selectCartSubtotal,
  selectCartTotal,
  useCartStore
} from '../../../stores/cart-store';
import type { PaymentSectionValue } from '../../payment-section/hooks/use-payment-section';

const EMPTY_PAYMENT: PaymentSectionValue = { method: null, isValid: false };

export function useCartSheet(onOpenChange: (open: boolean) => void) {
  const items = useCartStore((state) => state.items);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore(selectCartSubtotal);
  const discountTotal = useCartStore(selectCartDiscountTotal);
  const total = useCartStore(selectCartTotal);

  const { data: catalog } = usePdvCatalogQuery();
  const { data: products = [] } = usePdvProductsQuery(catalog?.id);

  const [customer, setCustomer] = useState<SaleCustomerInput | null>(null);
  const [payment, setPayment] = useState<PaymentSectionValue>(EMPTY_PAYMENT);

  const { mutate: confirmSale, isPending } = useConfirmPosSaleMutation();

  function availableStockFor(item: CartItem): number {
    return PdvCartService.getAvailableStock(item, products);
  }

  const hasStockIssue = PdvCartService.hasStockIssue(items, products);
  const isEmpty = items.length === 0;
  const canConfirm =
    !isEmpty && !hasStockIssue && !isPending && payment.isValid;

  function handleUpdateQty(item: CartItem, quantity: number) {
    updateQty(item.productId, item.variantId, quantity);
  }

  function handleRemove(item: CartItem) {
    removeItem(item.productId, item.variantId);
  }

  function handleGoToCatalog() {
    onOpenChange(false);
  }

  function handleConfirm() {
    if (!catalog || !payment.method) return;

    confirmSale(
      {
        catalogId: catalog.id,
        customer,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          referencePrice: item.unitPrice,
          discountAmount: item.discount,
          availableStock: availableStockFor(item)
        })),
        paymentMethod: payment.method,
        amountPaid: payment.amountPaid,
        proofFile: payment.proofFile
      },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return {
    items,
    subtotal,
    discountTotal,
    total,
    availableStockFor,
    hasStockIssue,
    isEmpty,
    canConfirm,
    isPending,
    customer,
    setCustomer,
    setPayment,
    handleUpdateQty,
    handleRemove,
    handleGoToCatalog,
    handleConfirm
  };
}
