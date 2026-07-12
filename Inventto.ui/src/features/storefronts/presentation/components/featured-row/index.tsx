import { Star, StarOff } from 'lucide-react';

import { ImageCard } from '@/shared/components/common/image-card';
import { cn } from '@/shared/utils';

import type { FeaturedProduct } from '../../../domain/entities';

interface FeaturedRowProps {
  product: FeaturedProduct;
  onToggle: (product: FeaturedProduct) => void;
  disabled?: boolean;
}

export function FeaturedRow({ product, onToggle, disabled }: FeaturedRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md border p-2',
        product.isFeatured && 'border-primary/40 bg-primary/5'
      )}
    >
      <div className="size-10 shrink-0 overflow-hidden rounded-md border">
        {product.imageUrl ? (
          <ImageCard src={product.imageUrl} alt={product.name} />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {product.name}
        </p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {product.sku}
        </p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onToggle(product)}
        aria-label={
          product.isFeatured
            ? `Remover destaque de ${product.name}`
            : `Destacar ${product.name}`
        }
        aria-pressed={product.isFeatured}
        className={cn(
          'shrink-0 text-muted-foreground transition-colors hover:text-primary disabled:pointer-events-none disabled:opacity-50',
          product.isFeatured && 'text-primary'
        )}
      >
        {product.isFeatured ? (
          <Star className="size-5 fill-current" />
        ) : (
          <StarOff className="size-5" />
        )}
      </button>
    </div>
  );
}
