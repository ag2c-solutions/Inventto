import { ShoppingCart } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/shared/components/ui/sheet';

import { CartItemRow } from '../cart-item';
import { CustomerSection } from '../customer-section';
import { EmptyCart } from '../empty-cart';
import { SaleSummary } from '../sale-summary';

import { useCartSheet } from './hooks/use-cart-sheet';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const {
    items,
    subtotal,
    discountTotal,
    total,
    availableStockFor,
    isEmpty,
    canConfirm,
    isPending,
    setCustomer,
    handleUpdateQty,
    handleRemove,
    handleGoToCatalog,
    handleConfirm
  } = useCartSheet(onOpenChange);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <SheetTitle>Venda atual</SheetTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'itens'} · revise
            antes de confirmar.
          </p>
        </SheetHeader>

        {isEmpty ? (
          <EmptyCart onGoToCatalog={handleGoToCatalog} />
        ) : (
          <>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              {items.map((item) => (
                <CartItemRow
                  key={`${item.productId}-${item.variantId ?? 'base'}`}
                  item={item}
                  availableStock={availableStockFor(item)}
                  onUpdateQty={(quantity) => handleUpdateQty(item, quantity)}
                  onRemove={() => handleRemove(item)}
                />
              ))}

              <CustomerSection onChange={setCustomer} />

              <SaleSummary
                subtotal={subtotal}
                discountTotal={discountTotal}
                total={total}
              />
            </div>

            <SheetFooter className="border-t">
              <Button
                type="button"
                className="w-full"
                disabled={!canConfirm}
                onClick={handleConfirm}
              >
                {isPending ? 'Registrando…' : 'Confirmar venda'}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
