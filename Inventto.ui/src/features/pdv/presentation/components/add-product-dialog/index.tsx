import { ColorBadge } from '@/shared/components/common/color-badge';
import { ImageCard } from '@/shared/components/common/image-card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog';
import { Separator } from '@/shared/components/ui/separator';
import { formatIntegerToDecimal } from '@/shared/utils';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import type { PdvProduct } from '../../../domain/entities';
import { parseVariantValues } from '../../utils/parse-variant-values';
import { DiscountFields } from '../discount-fields';
import { QtyStepper } from '../qty-stepper';

import { useAddProductDialog } from './hooks/use-add-product-dialog';

interface AddProductDialogProps {
  product: PdvProduct | null;
  onOpenChange: (open: boolean) => void;
}

export function AddProductDialog({
  product,
  onOpenChange
}: AddProductDialogProps) {
  const {
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
    validationMessage,
    confirm
  } = useAddProductDialog(product);

  function handleConfirm() {
    confirm();
    onOpenChange(false);
  }

  const variantValues = product?.variantLabel
    ? parseVariantValues(product.variantLabel)
    : [];

  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        {product && (
          <>
            {/* ── Header ── */}
            <DialogHeader className="p-5 pb-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                  <ImageCard src={product.imageUrl ?? ''} alt={product.name} />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 text-left">
                  <DialogTitle className="truncate text-base font-semibold">
                    {product.name}
                  </DialogTitle>
                  {variantValues.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {variantValues.map((value, index) =>
                        value.includes('#') ? (
                          <ColorBadge
                            key={index}
                            color={value}
                            className="h-5 font-normal bg-sidebar/80"
                          />
                        ) : (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="h-5 px-1.5 text-xs font-normal bg-sidebar/80 "
                          >
                            {value}
                          </Badge>
                        )
                      )}
                    </div>
                  )}
                  <span className="font-mono text-xs text-muted-foreground">
                    Preço de referência ·{' '}
                    {formatCurrency(formatIntegerToDecimal(product.price))}
                  </span>
                </div>
              </div>
            </DialogHeader>

            <Separator className="opacity-60" />
            <div className="px-4">
              {/* ── Quantidade ── */}
              <div className="flex flex-col gap-3 p-5">
                <p className="text-sm font-semibold">Quantidade</p>
                <QtyStepper
                  value={qty}
                  onIncrement={increment}
                  onDecrement={decrement}
                  decrementDisabled={atMin}
                  incrementDisabled={atMax}
                  helperText={
                    lowBalance ? `Apenas ${available} disponíveis.` : undefined
                  }
                />
              </div>

              <Separator className="opacity-60" />

              {/* ── Desconto ── */}
              <div className="p-5">
                <DiscountFields
                  enabled={discountOn}
                  onToggle={setDiscountOn}
                  mode={discountMode}
                  onModeChange={setDiscountMode}
                  value={discountValue}
                  onValueChange={setDiscountValue}
                  referencePrice={product.price}
                  discountAmount={pricing.discountAmount}
                  unitFinalPrice={pricing.unitFinalPrice}
                  invalid={invalid}
                  errorMessage={validationMessage}
                />
              </div>
            </div>

            <Separator className="opacity-60" />

            {/* ── Footer ── */}
            <DialogFooter className="grid grid-cols-2 gap-2 p-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="button" disabled={invalid} onClick={handleConfirm}>
                Adicionar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
