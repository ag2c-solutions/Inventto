import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Cpu,
  FileText
} from 'lucide-react';

import { ActionButton, VisibleTo } from '@/features/permissions';

import { DataTableHeaderSortableColumn } from '@/shared/components/common/data-table/pieces/datatable-header-sortable-column';
import { dateRangeFilter } from '@/shared/components/common/data-table/utils';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils';

import type { Movement } from '../../../../domain/entities';

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
    id: 'actions',
    size: 30,
    enableResizing: false,
    header: () => null,
    cell: ({ row }) => (
      <div className="flex justify-center pr-2">
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
  },
  {
    accessorKey: 'createdAt',
    id: 'createdAt',
    minSize: 120,
    header: ({ column }) => (
      <DataTableHeaderSortableColumn column={column} title="Data" />
    ),
    cell: ({ row }) => {
      const date = row.original.executedAt || row.original.createdAt;

      return (
        <div className="flex flex-col">
          <span className="text-foreground font-medium">
            {format(date, 'dd/MM/yyyy', { locale: ptBR })}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(date, 'HH:mm', { locale: ptBR })}
          </span>
        </div>
      );
    },
    filterFn: dateRangeFilter as never
  },
  {
    accessorKey: 'type',
    minSize: 120,
    header: 'Tipo',
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={cn(
          'capitalize',
          row.original.type === 'entry' &&
            'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900',
          row.original.type === 'withdrawal' &&
            'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'
        )}
      >
        {row.original.type === 'entry' && <ArrowUp className="w-3 h-3 " />}
        {row.original.type === 'withdrawal' && (
          <ArrowDown className="w-3 h-3 " />
        )}

        <span>{row.original.type === 'entry' ? 'Entrada' : 'Saída'}</span>
      </Badge>
    )
  },
  {
    accessorKey: 'reason',
    enableGlobalFilter: true,
    minSize: 250,
    header: 'Motivo / Doc.',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span
          className="font-medium truncate max-w-[200px]"
          title={row.original.reason}
        >
          {row.original.reason || 'Sem motivo'}
        </span>
        {row.original.documentNumber ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <FileText className="w-3 h-3" />
            <span>{row.original.documentNumber}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <FileText className="w-3 h-3" />
            <span>Sem documento</span>
          </div>
        )}
      </div>
    )
  },
  {
    accessorKey: 'user.fullName',
    id: 'user',
    minSize: 200,
    header: 'Responsável',
    cell: ({ row }) => {
      const user = row.original.user;

      if (!user) {
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted border">
              <Cpu className="h-3 w-3" />
            </div>
            <span className="text-sm">Sistema</span>
          </div>
        );
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
    size: 50,
    enableResizing: false,
    enableGlobalFilter: false,
    header: ({ column }) => (
      <DataTableHeaderSortableColumn column={column} title="Qtd. de itens" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col text-center">
        <span
          className={cn(
            'font-bold tabular-nums text-sm',
            row.original.type === 'entry' &&
              'text-green-600 dark:text-green-400',
            row.original.type === 'withdrawal' &&
              'text-red-600 dark:text-red-400'
          )}
        >
          {row.original.type === 'entry' ? '+' : '-'}
          {row.original.totalQuantity}
        </span>
        <span className="text-xs text-muted-foreground">
          {row.original.items ? row.original.items.length : 0}{' '}
          {row.original.items?.length === 1 ? 'item' : 'itens'}
        </span>
      </div>
    )
  },
  {
    accessorKey: 'totalValue',
    size: 30,
    enableResizing: false,
    enableGlobalFilter: false,
    header: () => (
      <VisibleTo action="movement:view_costs">
        <div className="flex w-full justify-end pr-4">Valor</div>
      </VisibleTo>
    ),
    cell: ({ row }) => (
      <VisibleTo action="movement:view_costs">
        <span className="font-medium text-foreground w-full flex justify-end pr-4">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(row.original.totalValue || 0)}
        </span>
      </VisibleTo>
    )
  }
];
