import type { CellContext, ColumnDef } from '@tanstack/react-table';

import type { IProduct, IProductVariant } from '../../../../domain/entities';
import { getVariantImages } from '../../../utils/get-variant-images';
import { ProductTableColumnImages } from '../../product-table/columns/images';
import { ProductTableColumnStock } from '../../product-table/columns/stock';
import { VariantOptionBadge } from '../../variants-options-badge';

/**
 * Colunas da sub-row de variantes. Os `id`s espelham os da tabela-mãe
 * (`columnsProductListTable`) porque o `NestedDataTable` só renderiza as
 * células cujo `column.id` está visível na tabela-mãe.
 */
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
          <span className="text-xs text-green-700">
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
    cell: ({ cell }) =>
      cell.row.original.stock !== undefined && (
        <ProductTableColumnStock
          totalStock={cell.row.original.stock}
          minimumStock={cell.row.original.minimumStock}
        />
      )
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
