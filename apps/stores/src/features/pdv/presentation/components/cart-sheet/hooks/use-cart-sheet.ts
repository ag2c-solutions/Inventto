import { useState } from 'react';

import { useOrganizationQuery } from '@/features/organizations';
import { useUser } from '@/features/users';

import type {
  CartItem,
  ConfirmedSale,
  SaleCustomerInput
} from '../../../../domain/entities';
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

  const { currentOrganization } = useUser();
  const { data: organization } = useOrganizationQuery();
  const { data: catalog } = usePdvCatalogQuery();
  const { data: products = [] } = usePdvProductsQuery(catalog?.id);

  const [customer, setCustomer] = useState<SaleCustomerInput | null>(null);
  const [payment, setPayment] = useState<PaymentSectionValue>(EMPTY_PAYMENT);
  const [confirmedSale, setConfirmedSale] = useState<ConfirmedSale | null>(
    null
  );

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

    // Snapshot do carrinho/pagamento antes de disparar a mutation — o
    // onSuccess de useConfirmPosSaleMutation já limpa o carrinho (PDV-03),
    // então os dados para o comprovante (PDV-06) precisam ser capturados
    // agora, não relidos da store depois.
    const saleItems = items;
    const paymentMethod = payment.method;
    const amountPaid = payment.amountPaid;
    const changeAmount =
      paymentMethod === 'cash' && amountPaid != null
        ? amountPaid - total
        : undefined;

    confirmSale(
      {
        catalogId: catalog.id,
        customer,
        items: saleItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          referencePrice: item.unitPrice,
          discountAmount: item.discount,
          availableStock: availableStockFor(item)
        })),
        paymentMethod,
        amountPaid,
        proofFile: payment.proofFile
      },
      {
        onSuccess: (orderId) => {
          setConfirmedSale({
            orderId,
            organizationName: currentOrganization?.name ?? '',
            organizationLogoUrl: organization?.settings.identity.logoUrl,
            confirmedAt: new Date(),
            items: saleItems,
            subtotal,
            discountTotal,
            total,
            paymentMethod,
            amountPaid,
            changeAmount,
            customer: customer ?? undefined
          });
        }
      }
    );
  }

  function handleNewSale() {
    setConfirmedSale(null);
    onOpenChange(false);
  }

  function handleSheetOpenChange(next: boolean) {
    // Fechar o Sheet por qualquer via (overlay, ESC, "Ver catálogo") também
    // limpa o comprovante — reabrir não deve mostrar a venda anterior.
    if (!next) setConfirmedSale(null);
    onOpenChange(next);
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
    confirmedSale,
    handleUpdateQty,
    handleRemove,
    handleGoToCatalog,
    handleConfirm,
    handleNewSale,
    handleSheetOpenChange
  };
}
