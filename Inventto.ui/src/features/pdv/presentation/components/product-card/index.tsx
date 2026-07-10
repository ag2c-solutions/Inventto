import { Plus } from 'lucide-react';

import { ImageCard } from '@/shared/components/common/image-card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { formatIntegerToDecimal } from '@/shared/utils';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import type { PdvProduct } from '../../../domain/entities';

interface ProductCardProps {
  product: PdvProduct;
  onAdd: (product: PdvProduct) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <div
      data-slot="pdv-product-card"
      data-state={product.isOut ? 'is-out' : 'in-stock'}
      className="flex flex-col gap-2 rounded-lg border bg-card p-3"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md">
        <ImageCard src={product.imageUrl ?? ''} alt={product.name} />
        {product.isOut && (
          <Badge variant="destructive" className="absolute right-2 top-2">
            esgotado
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-foreground">
          {product.name}
        </span>
        {product.variantLabel && (
          <span className="truncate text-xs text-muted-foreground">
            {product.variantLabel}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">
          {formatCurrency(formatIntegerToDecimal(product.price))}
        </span>

        <Button
          type="button"
          size="icon"
          aria-label="Adicionar produto"
          disabled={product.isOut}
          onClick={() => onAdd(product)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
