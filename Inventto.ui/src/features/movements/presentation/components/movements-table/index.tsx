import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  type ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type TableOptions
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDown, ArrowUp, XCircle } from 'lucide-react';

import {
  DataTable,
  DataTableContent,
  DataTableDateRangeFilter,
  DataTableSelectFilter,
  DataTableTextFilter,
  PaginationControllers
} from '@/shared/components/common/data-table';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils';

import type { Movement } from '../../../domain/entities';
import { ItemsList } from '../items-list';

import { columnsMovementsListTable } from './columns';

interface MovementsListTableProps {
  data: Movement[];
  productId?: string;
}

export function MovementsListTable({
  data,
  productId
}: MovementsListTableProps) {
  const [isExpanded, setIsExpanded] = useState<ExpandedState>({});

  const tableOptions: TableOptions<Movement> = useMemo(() => {
    return {
      columns: columnsMovementsListTable,
      data: data || [],
      state: {
        expanded: isExpanded
      },
      onExpandedChange: setIsExpanded,
      getCoreRowModel: getCoreRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      globalFilterFn: 'includesString'
    };
  }, [isExpanded, data]);

  const renderMovementsItems = useCallback((row: Row<Movement>) => {
    const parent = row.original;
    const date = parent.executedAt || parent.createdAt;

    return (
      <div className="p-4 bg-muted/30">
        <div className="rounded-md border bg-background overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={cn(
                  'capitalize',
                  parent.type === 'entry' &&
                    'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900',
                  parent.type === 'withdrawal' &&
                    'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'
                )}
              >
                {parent.type === 'entry' && (
                  <ArrowUp className="w-3 h-3 mr-1.5" />
                )}
                {parent.type === 'withdrawal' && (
                  <ArrowDown className="w-3 h-3 mr-1.5" />
                )}

                <span>{parent.type === 'entry' ? 'Entrada' : 'Saída'}</span>
              </Badge>
              <h4 className="font-semibold text-sm">
                Detalhes da movimentação
              </h4>
            </div>
            <div className="text-sm text-muted-foreground">
              {format(date, "dd/MM/yyyy '·' HH:mm", { locale: ptBR })}
            </div>
          </div>
          {parent.reason === 'Outro' && parent.description && (
            <div className="px-4 py-3 border-b bg-muted/10 italic text-sm text-muted-foreground">
              &ldquo;{parent.description}&rdquo;
            </div>
          )}
          <ItemsList data={parent.items} parentData={parent} />
        </div>
      </div>
    );
  }, []);

  return (
    <DataTable tableOptions={tableOptions} renderSubRow={renderMovementsItems}>
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <DataTableTextFilter
            placeholder="Buscar por motivo, doc ou responsável..."
            className="max-w-[300px]"
          />
          <DataTableSelectFilter
            column="type"
            placeholder="Tipo"
            options={[
              {
                value: 'all',
                label: 'Todos os tipos'
              },
              {
                value: 'entry',
                label: 'Entrada'
              },
              {
                value: 'withdrawal',
                label: 'Saída'
              },
              {
                value: 'adjustment',
                label: 'Ajuste'
              }
            ]}
          />
          <DataTableDateRangeFilter column="createdAt" />
        </div>
        <div className="w-full md:w-[unset] flex gap-3">
          {productId && (
            <Button variant="outline" size="sm" asChild>
              <Link
                to="/movements"
                className="flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <XCircle className="h-4 w-4" />
                Limpar filtro de produto
              </Link>
            </Button>
          )}
        </div>
      </div>

      <section className="my-2.5 border rounded-lg overflow-hidden">
        <DataTableContent />
      </section>

      <section className="w-full">
        <PaginationControllers />
      </section>
    </DataTable>
  );
}
