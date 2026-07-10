import { Trash2, TriangleAlert } from 'lucide-react';

import { ColorBadge } from '@/shared/components/common/color-badge';
import { ImageCard } from '@/shared/components/common/image-card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { cn, formatIntegerToDecimal } from '@/shared/utils';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import type { CartItem } from '../../../domain/entities';
import { parseVariantValues } from '../../utils/parse-variant-values';
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
  const variantValues = item.variantLabel
    ? parseVariantValues(item.variantLabel)
    : [];

  return (
    <div
      data-slot="pdv-cart-item"
      data-state={isWarn ? 'is-warn' : 'ok'}
      className={cn(
        'flex gap-3 py-4',
        isWarn &&
          'rounded-lg border border-amber-400 bg-amber-50/60 p-3 dark:bg-amber-950/10'
      )}
    >
      {/* Product image */}
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted/40">
        <ImageCard src={item.imageUrl ?? ''} alt={item.name} />
      </div>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-medium leading-snug">
          {item.name}
        </span>

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
        />

        {isWarn && (
          <span className="flex items-center gap-1 text-xs text-amber-600">
            <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
            Apenas {availableStock} disponíveis.
          </span>
        )}
      </div>

      {/* Price + remove */}
      <div className="flex shrink-0 flex-col items-end justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
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
