import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils';

import type { IProduct, ProductStockStatus } from '../../../domain/entities';
import { getGradeStockConsolidation } from '../../../domain/utils/get-grade-stock-consolidation';
import { getStockStatus } from '../../../domain/utils/get-stock-status';
import { STOCK_STATUS_CONFIG } from '../../constants/status-config';
import { getImageSrc } from '../../utils/get-img-src';

import { ProductTableColumnActions } from './columns/actions';

/** Ordem do resumo de estados na grade (espelha o wireframe mobile). */
const SUMMARY_ORDER: ProductStockStatus[] = [
  'critical',
  'zeroed',
  'warning',
  'healthy'
];

type ProductCardProps = {
  product: IProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const [expanded, setExpanded] = useState(false);

  const primaryImage =
    product.allImages.find((image) => image.isPrimary) ?? product.allImages[0];

  const hasVariants =
    product.hasVariants && (product.variants?.length ?? 0) > 0;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-card',
        !product.isActive && 'opacity-60'
      )}
    >
      <div className="relative aspect-[4/3] w-full bg-muted">
        <Avatar className="h-full w-full rounded-none">
          {primaryImage && (
            <AvatarImage
              src={getImageSrc(primaryImage, 600)}
              alt={product.name}
              className="object-cover"
            />
          )}
          <AvatarFallback className="rounded-none text-xs text-muted-foreground">
            IMG
          </AvatarFallback>
        </Avatar>

        <ProductTableColumnActions
          productId={product.id}
          className="absolute right-2 top-2 w-auto p-0 pr-0"
          triggerClassName="size-8 rounded-md border bg-background/90 backdrop-blur-sm text-foreground shadow-sm hover:bg-background"
        />
      </div>

      <div className="flex flex-col gap-2 p-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {product.name}
          </span>
          <span className="font-mono text-xs text-green-700">
            {product.sku}
          </span>
        </div>

        {product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.categories.map((category) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="rounded-md font-normal"
              >
                {category.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {hasVariants ? (
        <ProductCardVariantsFooter
          product={product}
          expanded={expanded}
          onToggle={() => setExpanded((prev) => !prev)}
        />
      ) : (
        <ProductCardSimpleFooter product={product} />
      )}
    </div>
  );
}

function ProductCardSimpleFooter({ product }: { product: IProduct }) {
  const status = getStockStatus(product.stock ?? 0, product.minimumStock);
  const config = STOCK_STATUS_CONFIG[status];

  return (
    <div className="flex items-center justify-between gap-2 border-t bg-muted/30 px-3 py-2.5">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <span className={config.textClassName}>{config.iconSmall}</span>
        {product.isActive ? `${product.stock ?? 0} un` : 'Inativo'}
      </span>

      {product.isActive && (
        <span className="text-xs text-muted-foreground">
          mín {product.minimumStock ?? 0}
        </span>
      )}
    </div>
  );
}

function ProductCardVariantsFooter({
  product,
  expanded,
  onToggle
}: {
  product: IProduct;
  expanded: boolean;
  onToggle: () => void;
}) {
  const variants = product.variants ?? [];
  const { summary } = getGradeStockConsolidation(variants);

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-t px-3 py-2.5">
        <span className="flex items-center gap-2.5">
          {SUMMARY_ORDER.filter((status) => summary[status] > 0).map(
            (status) => {
              const config = STOCK_STATUS_CONFIG[status];

              return (
                <span
                  key={status}
                  className={cn(
                    'flex items-center gap-1 text-sm font-semibold',
                    config.textClassName
                  )}
                >
                  {config.iconSmall}
                  {summary[status]}
                </span>
              );
            }
          )}
        </span>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? 'Recolher variações' : 'Expandir variações'}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
        >
          {variants.length} variações
          <ChevronDown
            className={cn(
              'size-4 transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </button>
      </div>

      {expanded && (
        <div className="border-t">
          {variants.map((variant) => {
            const status = getStockStatus(variant.stock, variant.minimumStock);
            const config = STOCK_STATUS_CONFIG[status];

            return (
              <div
                key={variant.id}
                className={cn(
                  'flex items-center justify-between gap-2 border-b px-3 py-2 last:border-b-0',
                  status === 'zeroed' && 'bg-muted/40'
                )}
              >
                <span className="truncate font-mono text-xs text-foreground">
                  {variant.sku}
                </span>

                <span className="flex items-center gap-2 text-xs font-semibold">
                  <span
                    className={cn('flex items-center', config.textClassName)}
                  >
                    {config.iconSmall}
                  </span>
                  <span className="tabular-nums text-foreground">
                    {variant.stock}
                  </span>
                  <span className="font-normal text-muted-foreground">
                    (Mín {variant.minimumStock})
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
