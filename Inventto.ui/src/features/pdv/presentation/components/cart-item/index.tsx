import { Trash2 } from 'lucide-react';

import { ImageCard } from '@/shared/components/common/image-card';
import { Button } from '@/shared/components/ui/button';
import { cn, formatIntegerToDecimal } from '@/shared/utils';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import type { CartItem } from '../../../domain/entities';
import { QtyStepper } from '../qty-stepper';

interface CartItemRowProps {
  item: CartItem;
  availableStock: number;
  onUpdateQty: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItemRow({
  item,
  availableStock,
  onUpdateQty,
  onRemove
}: CartItemRowProps) {
  const hasDiscount = item.discount > 0;
  const finalUnitPrice = item.unitPrice - item.discount;
  const referenceSubtotal = item.unitPrice * item.quantity;
  const finalSubtotal = finalUnitPrice * item.quantity;
  const isWarn = item.quantity > availableStock;

  return (
    <div
      data-slot="pdv-cart-item"
      data-state={isWarn ? 'is-warn' : 'ok'}
      className={cn(
        'flex gap-3 rounded-lg border p-3',
        isWarn && 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/10'
      )}
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border">
        <ImageCard src={item.imageUrl ?? ''} alt={item.name} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-medium">{item.name}</span>
        {item.variantLabel && (
          <span className="truncate text-xs text-muted-foreground">
            {item.variantLabel}
          </span>
        )}
        {hasDiscount && (
          <span className="text-xs text-destructive">
            Desconto: − {formatCurrency(formatIntegerToDecimal(item.discount))}
          </span>
        )}

        <QtyStepper
          value={item.quantity}
          onIncrement={() => onUpdateQty(item.quantity + 1)}
          onDecrement={() => onUpdateQty(item.quantity - 1)}
          decrementDisabled={item.quantity <= 1}
          incrementDisabled={item.quantity >= availableStock}
          helperText={
            isWarn ? `Apenas ${availableStock} disponíveis.` : undefined
          }
        />
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Remover item"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <div className="flex flex-col items-end">
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(formatIntegerToDecimal(referenceSubtotal))}
            </span>
          )}
          <span className="text-sm font-semibold">
            {formatCurrency(formatIntegerToDecimal(finalSubtotal))}
          </span>
        </div>
      </div>
    </div>
  );
}
