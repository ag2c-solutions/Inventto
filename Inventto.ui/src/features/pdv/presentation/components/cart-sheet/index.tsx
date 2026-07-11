import { Loader2, ShoppingCart } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/shared/components/ui/sheet';
import { useIsMobile } from '@/shared/hooks/use-is-mobile';
import { cn } from '@/shared/utils';

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

  // PDV-04: mesmo Sheet do PDV-03 — só muda de lado por breakpoint (de baixo
  // no mobile, à direita no desktop). O wireframe fala em "< lg", mas o
  // projeto já padroniza esse corte em useIsMobile (768px, CAT-05); manter
  // um segundo breakpoint só para o PDV criaria dois cortes "mobile"
  // diferentes na mesma aplicação.
  const isMobile = useIsMobile();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={cn(
          'flex flex-col gap-0 p-0',
          isMobile ? 'max-h-[85vh] rounded-t-lg' : 'sm:max-w-md'
        )}
      >
        {/* Header */}
        <SheetHeader className="border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <SheetTitle className="text-lg">Venda atual</SheetTitle>
          </div>
          <p className="text-sm text-sidebar-foreground">
            {items.length} {items.length === 1 ? 'item' : 'itens'} · revise
            antes de confirmar.
          </p>
        </SheetHeader>

        {isEmpty ? (
          <>
            {/* Empty state fills remaining space */}
            <EmptyCart />

            {/* Footer for empty state */}
            <div className="border-t px-5 py-4">
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-lg"
                onClick={handleGoToCatalog}
              >
                Ver catálogo
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Scrollable items + customer */}
            <div className="flex flex-1 flex-col overflow-y-auto">
              {/* Items list with dividers */}
              <div className="flex flex-col divide-y px-5">
                {items.map((item) => (
                  <CartItemRow
                    key={`${item.productId}-${item.variantId ?? 'base'}`}
                    item={item}
                    availableStock={availableStockFor(item)}
                    onUpdateQty={(quantity) => handleUpdateQty(item, quantity)}
                    onRemove={() => handleRemove(item)}
                  />
                ))}
              </div>

              {/* Customer section */}
              <div className="border-t px-5 py-4">
                <CustomerSection onChange={setCustomer} />
              </div>
            </div>

            {/* Summary + CTA — pinned at bottom */}
            <div className="border-t">
              <SaleSummary
                subtotal={subtotal}
                discountTotal={discountTotal}
                total={total}
              />

              <div className="px-5 pb-5">
                <Button
                  type="button"
                  className="h-12 w-full rounded-lg bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
                  disabled={!canConfirm}
                  onClick={handleConfirm}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Registrando…
                    </>
                  ) : (
                    'Confirmar venda'
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
