import type { CellContext, ColumnDef } from '@tanstack/react-table';

import { ImageCard } from '@/shared/components/common/image-card';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils';

import type { Movement, MovementItem } from '../../../domain/entities';

export const columnsMovementsItemsTable: ColumnDef<MovementItem>[] = [
  {
    accessorKey: 'product.name',
    header: 'Produto',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8 overflow-hidden rounded-md border bg-muted">
          <ImageCard
            src={row.original.product.imageUrl || '/placeholder.svg'}
            alt={row.original.product.name}
          />
        </div>
        <span className="font-medium">{row.original.product.name}</span>
      </div>
    )
  },
  {
    accessorKey: 'product.variantOptions',
    header: 'Variante',
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-normal">
        {row.original.product.variantOptions
          ? row.original.product.variantOptions
          : 'Item único'}
      </Badge>
    )
  },
  {
    accessorKey: 'quantity',
    header: 'Quantidade',
    cell: (cellContext: CellContext<MovementItem, unknown>) => {
      const parent = cellContext.table.options.meta?.parentData as Movement;

      if (!parent) return <span>{cellContext.row.original.quantity}</span>;

      return (
        <span
          className={cn(
            'font-medium',
            parent.type === 'entry' && 'text-green-600 dark:text-green-400',
            parent.type === 'withdrawal' && 'text-red-600 dark:text-red-400',
            parent.type === 'adjustment' &&
              'text-orange-600 dark:text-orange-400'
          )}
        >
          {parent.type === 'entry'
            ? '+'
            : parent.type === 'withdrawal'
              ? '-'
              : ''}
          {cellContext.row.original.quantity}
        </span>
      );
    }
  },
  {
    accessorKey: 'unitCost',
    header: 'Custo Unit.',
    cell: ({ row }) => {
      const value = row.original.unitCost;
      return (
        <span className="text-muted-foreground">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(value)}
        </span>
      );
    }
  }
];
