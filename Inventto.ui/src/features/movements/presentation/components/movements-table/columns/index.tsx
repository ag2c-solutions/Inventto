import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { ActionButton } from '@/features/permissions';

import { DataTableHeaderSortableColumn } from '@/shared/components/common/datatable/pieces/datatable-header-sortable-column';
import { dateRangeFilter } from '@/shared/components/common/datatable/utils';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils';

import type { Movement } from '../../../domain/entities';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export const columnsMovementsListTable: ColumnDef<Movement>[] = [
  {
    accessorKey: 'createdAt',
    id: 'createdAt',
    minSize: 100,
    header: ({ column }) => (
      <DataTableHeaderSortableColumn column={column} title="Data" />
    ),
    cell: ({ row }) => {
      const date = row.original.createdAt;

      return (
        <div className="flex flex-col">
          <span className="text-foreground font-bold">
            {format(date, 'd MMM', { locale: ptBR })}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(date, 'HH:mm', { locale: ptBR })}
          </span>
        </div>
      );
    },
    filterFn: dateRangeFilter
  },
  {
    accessorKey: 'type',
    minSize: 100,
    header: 'Tipo',
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={cn(
          'capitalize',
          row.original.type === 'entry' &&
            'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900',
          row.original.type === 'withdrawal' &&
            'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900',
          row.original.type === 'adjustment' &&
            'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900'
        )}
      >
        {row.original.type === 'entry' && 'Entrada'}
        {row.original.type === 'withdrawal' && 'Saída'}
        {row.original.type === 'adjustment' && 'Ajuste'}
      </Badge>
    )
  },
  {
    accessorKey: 'reason',
    enableGlobalFilter: true,
    minSize: 150,
    header: 'Motivo / Doc',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span
          className="font-medium truncate max-w-[200px]"
          title={row.original.reason}
        >
          {row.original.reason || 'Sem motivo'}
        </span>
        {row.original.documentNumber && (
          <span className="text-xs text-muted-foreground">
            Doc: {row.original.documentNumber}
          </span>
        )}
      </div>
    )
  },
  {
    accessorKey: 'user.fullName',
    id: 'user',
    minSize: 140,
    header: 'Responsável',
    cell: ({ row }) => {
      const user = row.original.user;

      if (!user) {
        return <span className="text-sm text-muted-foreground">-</span>;
      }

      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={user.avatarUrl || undefined} />
            <AvatarFallback className="text-[10px]">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <span
            className="text-sm text-muted-foreground hidden sm:inline-block truncate max-w-[120px]"
            title={user.fullName}
          >
            {user.fullName}
          </span>
        </div>
      );
    }
  },
  {
    accessorKey: 'totalQuantity',
    enableGlobalFilter: false,
    header: ({ column }) => (
      <DataTableHeaderSortableColumn column={column} title="Qtd. Total" />
    ),
    cell: ({ row }) => (
      <span className="font-bold tabular-nums">
        {row.original.totalQuantity}
      </span>
    )
  },
  {
    id: 'actions',
    minSize: 50,
    header: () => <div className="text-right pr-3">Detalhes</div>,
    cell: ({ row }) => (
      <div className="flex justify-end pr-3">
        {row.original.items && row.original.items.length > 0 ? (
          <ActionButton
            action="movement:details"
            variant="ghost"
            size="icon-sm"
            onClick={() => row.toggleExpanded()}
            className="h-8 w-8 p-0"
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle details</span>
          </ActionButton>
        ) : null}
      </div>
    )
  }
];
