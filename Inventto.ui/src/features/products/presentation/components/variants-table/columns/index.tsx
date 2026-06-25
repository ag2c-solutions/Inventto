import type { CellContext, ColumnDef } from '@tanstack/react-table';

import { cn } from '@/shared/utils';

import type { IProduct, IProductVariant } from '../../../../domain/entities';
import { getStockStatus } from '../../../../domain/utils/get-stock-status';
import { STOCK_STATUS_CONFIG } from '../../../constants/status-config';
import { getVariantImages } from '../../../utils/get-variant-images';
import { ProductTableColumnImages } from '../../product-table/columns/images';
import { VariantOptionBadge } from '../../variants-options-badge';

export const productVariantsTableColumns: ColumnDef<IProductVariant>[] = [
  {
    id: 'expander',
    header: '',
    enableResizing: false,
    cell: () => null
  },
  {
    id: 'product',
    header: 'Variante',
    cell: (cellContext: CellContext<IProductVariant, unknown>) => {
      const parent = cellContext.table.options.meta?.parentData as IProduct;

      const variantImagesId = new Set(
        cellContext.row.original.images.map((img) => img.id)
      );
      const primaryImageVariantId = cellContext.row.original.images.find(
        (image) => image.isPrimary === true
      )?.id;

      const variantImages = getVariantImages({
        allImages: parent?.allImages ?? [],
        variantImagesId,
        primaryImageVariantId
      });

      return (
        <div className="flex items-center gap-3 pl-2">
          <ProductTableColumnImages images={variantImages} />
          <span className="font-mono text-xs text-green-700">
            {cellContext.row.original.sku}
          </span>
        </div>
      );
    }
  },
  {
    id: 'category',
    header: 'Atributos',
    cell: (cell) => (
      <div className="flex flex-wrap gap-1">
        {cell.row.original.options.map((option, index) => (
          <VariantOptionBadge
            key={`${cell.row.original.id}-${option.name}-${index}`}
            option={option}
          />
        ))}
      </div>
    )
  },
  {
    id: 'stock',
    accessorKey: 'stock',
    header: 'Estoque',
    enableResizing: false,
    cell: ({ cell }) => {
      const variant = cell.row.original;

      if (variant.stock === undefined) {
        return null;
      }

      const status = getStockStatus(variant.stock, variant.minimumStock);
      const config = STOCK_STATUS_CONFIG[status];

      return (
        <div className="flex items-center gap-1.5 text-sm">
          <span
            className={cn('flex items-center', config.textClassName)}
            title={config.label}
            aria-label={`Status do estoque: ${config.label}`}
          >
            {config.iconSmall}
          </span>
          <span className="font-medium tabular-nums text-foreground">
            {variant.stock}
          </span>
          <span className="text-xs text-muted-foreground">
            (Mín {variant.minimumStock})
          </span>
        </div>
      );
    }
  },
  {
    id: 'status',
    header: '',
    cell: () => null
  },
  {
    id: 'actions',
    header: '',
    enableResizing: false,
    cell: () => null
  }
];
