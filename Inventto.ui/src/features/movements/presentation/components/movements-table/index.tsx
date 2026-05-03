import { useCallback, useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router';
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
import { ArrowRightLeft, XCircle } from 'lucide-react';

import { ActionButton } from '@/features/permissions';

import {
  DataTable,
  DataTableContent,
  DataTableDateRangeFilter,
  DataTableSelectFilter,
  DataTableTextFilter,
  PaginationControllers
} from '@/shared/components/common/datatable';
import { Button } from '@/shared/components/ui/button';

import type { Movement } from '../../domain/entities';
import { MovementsItemsTable } from '../movements-items-table';

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
    return (
      <div className="p-4 bg-muted/30">
        <div className="rounded-md border bg-background overflow-hidden">
          <MovementsItemsTable
            data={row.original.items}
            parentData={row.original}
          />
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
          <ActionButton action="movement:create" size={'sm'} className="w-full">
            <NavLink
              className="flex gap-2 justify-center items-center"
              to={'new'}
            >
              <ArrowRightLeft className="h-4 w-4" />
              Nova Movimentação
            </NavLink>
          </ActionButton>

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
