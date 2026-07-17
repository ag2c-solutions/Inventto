import { memo } from 'react';

import { cn } from '@/shared/utils';

import type { IProduct, IProductVariant } from '../../../domain/entities';
import { getStockStatus } from '../../../domain/utils/get-stock-status';
import { STOCK_STATUS_CONFIG } from '../../constants/status-config';
import { getVariantImages } from '../../utils/get-variant-images';
import { ProductTableColumnImages } from '../product-table/columns/images';
import { VariantOptionBadge } from '../variants-options-badge';

type ProductVariantsTableProps = {
  productImages: IProduct['allImages'];
  variants: IProductVariant[];
};

function ProductVariantsTableComponent({
  productImages,
  variants
}: ProductVariantsTableProps) {
  const GRID =
    'grid grid-cols-[2.5rem_minmax(8rem,12rem)_1fr_auto] items-center gap-8';

  return (
    <>
      <div
        className={cn(
          GRID,
          'border-b bg-muted/30 px-6 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground'
        )}
      >
        <span />
        <span>SKU</span>
        <span>Atributos</span>
        <span className="justify-self-end">Estoque</span>
      </div>

      {variants.map((variant) => {
        const status = getStockStatus(variant.stock, variant.minimumStock);
        const variantImages = getVariantImages({
          allImages: productImages ?? [],
          variantImagesId: new Set(variant.images.map((img) => img.id)),
          primaryImageVariantId: variant.images.find(
            (img) => img.isPrimary === true
          )?.id
        });

        const config = STOCK_STATUS_CONFIG[status];
        const isZeroed = status === 'zeroed';

        return (
          <div
            key={variant.id}
            className={cn(
              GRID,
              'border-b px-6 py-3 last:border-b-0',
              isZeroed && 'bg-muted/40'
            )}
          >
            <div>
              <ProductTableColumnImages images={variantImages} />
            </div>

            <span className="truncate font-mono text-sm text-foreground">
              {variant.sku}
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              {variant.options.map((option, index) => (
                <VariantOptionBadge
                  key={`${variant.id}-${option.name}-${index}`}
                  option={option}
                />
              ))}
            </div>

            <div className="flex items-center justify-self-end gap-1.5 text-sm">
              <div className="flex w-5 items-center justify-center">
                <span
                  className={cn('flex items-center', config.textClassName)}
                  title={config.label}
                  aria-label={`Status do estoque: ${config.label}`}
                >
                  {config.iconSmall}
                </span>
              </div>
              <div className="flex w-6 items-center justify-center">
                <span className="font-medium tabular-nums text-foreground">
                  {variant.stock}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                (Mín {variant.minimumStock})
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}

export const ProductVariantsTable = memo(
  ProductVariantsTableComponent
) as typeof ProductVariantsTableComponent;
