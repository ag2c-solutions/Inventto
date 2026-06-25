import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import { ChevronRight } from 'lucide-react';

import { DataTableHeaderSortableColumn } from '@/shared/components/common/data-table/pieces/datatable-header-sortable-column';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils';

import type { IProduct } from '../../../../domain/entities';
import { deriveProductStatus } from '../../../utils/derive-product-status';

import { ProductTableColumnActions } from './actions';
import { ProductTableColumnProduct } from './product-cell';
import { ProductTableColumnStatus } from './status';
import { ProductTableColumnStock } from './stock';

const categoryFilterFn: FilterFn<IProduct> = (row, _columnId, value) =>
  row.original.categories.some((category) => category.id === value);

const statusFilterFn: FilterFn<IProduct> = (row, _columnId, value) =>
  deriveProductStatus(row.original) === value;

export const columnsProductListTable: ColumnDef<IProduct>[] = [
  {
    id: 'expander',
    header: '',
    enableGlobalFilter: false,
    enableResizing: false,
    enableHiding: false,
    enableSorting: false,
    size: 48,
    cell: ({ row }) =>
      row.original.hasVariants && row.original.variants.length > 0 ? (
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          aria-label={
            row.getIsExpanded() ? 'Recolher variações' : 'Expandir variações'
          }
          aria-expanded={row.getIsExpanded()}
          onClick={() => row.toggleExpanded()}
        >
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-transform',
              row.getIsExpanded() && 'rotate-90'
            )}
          />
        </Button>
      ) : null
  },
  {
    id: 'product',
    accessorFn: (row) => `${row.name} ${row.sku}`,
    minSize: 280,
    header: ({ column }) => (
      <DataTableHeaderSortableColumn
        className="text-sidebar-foreground"
        column={column}
        title="Produto"
      />
    ),
    cell: ({ row }) => <ProductTableColumnProduct product={row.original} />,
    meta: {
      nameInFilters: 'Produto'
    }
  },
  {
    id: 'category',
    accessorFn: (row) => row.categories.map((category) => category.id),
    header: 'Categorias',
    enableGlobalFilter: false,
    enableSorting: false,
    enableResizing: false,
    minSize: 280,
    filterFn: categoryFilterFn,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.categories.map((category) => (
          <Badge
            key={category.id}
            variant="secondary"
            className="rounded-md font-normal"
          >
            {category.name}
          </Badge>
        ))}
      </div>
    )
  },
  {
    accessorKey: 'stock',
    enableGlobalFilter: false,
    enableSorting: false,
    header: 'Estoque',
    minSize: 150,
    enableResizing: false,
    cell: ({ row }) => {
      const product = row.original;

      return (
        <ProductTableColumnStock
          totalStock={product.stock ?? 0}
          minimumStock={product.minimumStock}
          variants={product.variants}
        />
      );
    }
  },
  {
    id: 'status',
    accessorFn: (row) => deriveProductStatus(row),
    header: 'Status',
    enableGlobalFilter: false,
    enableSorting: false,
    enableResizing: false,
    minSize: 150,
    filterFn: statusFilterFn,
    cell: ({ row }) => (
      <ProductTableColumnStatus isActive={row.original.isActive} />
    )
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-sidebar-foreground w-full flex justify-center">
        Ações
      </div>
    ),
    minSize: 80,
    enableGlobalFilter: false,
    enableResizing: false,
    enableHiding: false,
    enableSorting: false,
    cell: (cell) => (
      <ProductTableColumnActions productId={cell.row.original.id || ''} />
    )
  }
];
