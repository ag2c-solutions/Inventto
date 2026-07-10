import { Plus } from 'lucide-react';

import { ColorBadge } from '@/shared/components/common/color-badge';
import { ImageCard } from '@/shared/components/common/image-card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { formatIntegerToDecimal } from '@/shared/utils';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import type { PdvProduct } from '../../../domain/entities';
import { parseVariantValues } from '../../utils/parse-variant-values';

interface ProductCardProps {
  product: PdvProduct;
  onAdd: (product: PdvProduct) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const variantValues = product.variantLabel
    ? parseVariantValues(product.variantLabel)
    : [];

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

      <div className="flex flex-col gap-1">
        <span className="truncate text-sm font-medium text-foreground">
          {product.name}
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
