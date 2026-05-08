import type { ColumnDef } from '@tanstack/react-table';

import { DataTableHeaderSortableColumn } from '@/shared/components/common/datatable/pieces/datatable-header-sortable-column';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

import type { IProduct } from '../../../../domain/entities';

import { ProductTableColumnActions } from './actions';
import { ProductTableColumnImages } from './images';
import { ProductTableColumnStock } from './stock';

export const columnsProductListTable: ColumnDef<IProduct>[] = [
  {
    accessorKey: 'allImages',
    minSize: 80,
    header: 'Imagens',
    enableGlobalFilter: false,
    enableResizing: false,
    cell: ({ row }) => (
      <ProductTableColumnImages
        images={row.original.allImages}
        productId={row.original.id}
      />
    )
  },
  {
    accessorKey: 'name',
    minSize: 250,
    header: ({ column }) => (
      <DataTableHeaderSortableColumn column={column} title="Nome" />
    ),
    cell: ({ row }) => <p className="font-normal">{row.original.name}</p>,
    meta: {
      nameInFilters: 'Nome'
    }
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    size: 200,
    enableResizing: false,
    cell: ({ row }) => <p className="text-green-700">{row.original.sku}</p>
  },
  {
    accessorKey: 'category',
    header: 'Categoria',
    enableGlobalFilter: false,
    size: 150,
    enableResizing: false,
    cell: ({ row }) => (
      <div>
        {row.original.categories.map((category) => {
          return (
            <Badge
              key={category.id}
              className="bg-green-200 text-green-950 font-bold rounded-sm h-7"
            >
              {category.name}
            </Badge>
          );
        })}
      </div>
    )
  },
  {
    accessorKey: 'stock',
    enableGlobalFilter: false,
    header: 'Estoque',
    minSize: 100,
    enableResizing: false,
    cell: ({ row }) => {
      const product = row.original;
      const calculatedTotalStock =
        product.hasVariants && product.variants
          ? product.variants.reduce(
              (acc, variant) => acc + (variant.stock || 0),
              0
            )
          : (product.stock ?? 0);

      return (
        <ProductTableColumnStock
          totalStock={calculatedTotalStock}
          minimumStock={product.minimumStock}
          variants={product.variants}
        />
      );
    }
  },
  {
    accessorKey: 'hasVariants',
    enableGlobalFilter: false,
    header: 'Variantes',
    enableResizing: false,
    enableHiding: false,
    minSize: 150,
    cell: ({ row }) =>
      row.original.variants &&
      row.original.variants.length > 0 && (
        <section className="flex w-full ">
          <Button
            variant={'outline'}
            size={'icon-sm'}
            onClick={() => row.toggleExpanded()}
          >
            {row.getIsExpanded() ? '-' : '+'}
          </Button>
        </section>
      )
  },
  {
    accessorKey: 'actions',
    header: '',
    minSize: 100,
    enableResizing: false,
    enableHiding: false,
    cell: (cell) => (
      <ProductTableColumnActions productId={cell.row.original.id || ''} />
    )
  }
];
