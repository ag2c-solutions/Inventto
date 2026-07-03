import { useCallback, useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router';
import {
  type ColumnFiltersState,
  type ExpandedState,
  type FilterFn,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type TableOptions
} from '@tanstack/react-table';
import { ArrowRightLeft, X } from 'lucide-react';

import { useUser } from '@/features/users';

import {
  DataTable,
  DataTableContent,
  DataTableDateRangeFilter,
  DataTableTextFilter,
  PaginationControllers
} from '@/shared/components/common/data-table';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

import type { Movement } from '../../../domain/entities';
import { MovementDetails } from '../details';

import {
  matchesProductSearch,
  resolveProductNameById
} from './utils/matches-product-search';
import { columnsMovementsListTable } from './columns';
import { MovementsListTableLoading } from './loading';
import { MovementsOnboardingEmpty } from './onboarding-empty';
import { MovementsTypeTabs } from './type-tabs';

interface MovementsListTableProps {
  data: Movement[];
  isLoading: boolean;
  productId?: string;
}

const globalFilterFn: FilterFn<Movement> = (row, _columnId, filterValue) =>
  matchesProductSearch(row.original, String(filterValue ?? ''));

export function MovementsListTable({
  data,
  isLoading,
  productId
}: MovementsListTableProps) {
  const { role } = useUser();
  const canManage = role !== 'sales';

  const [isExpanded, setIsExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const productName = useMemo(
    () => resolveProductNameById(data, productId),
    [data, productId]
  );

  const tableOptions: TableOptions<Movement> = useMemo(() => {
    return {
      columns: columnsMovementsListTable,
      data: data || [],
      state: {
        expanded: isExpanded,
        globalFilter,
        columnFilters
      },
      onExpandedChange: setIsExpanded,
      onGlobalFilterChange: setGlobalFilter,
      onColumnFiltersChange: setColumnFilters,
      globalFilterFn,
      getCoreRowModel: getCoreRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel()
    };
  }, [isExpanded, data, globalFilter, columnFilters]);

  const renderMovementsItems = useCallback((row: Row<Movement>) => {
    return <MovementDetails movement={row.original} />;
  }, []);

  if (isLoading) {
    return <MovementsListTableLoading />;
  }

  if (!data || data.length === 0) {
    if (productId) {
      return (
        <div className="flex flex-col gap-4">
          <ProductFilterChip productName={productName} />
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma movimentação encontrada para este produto.
          </p>
        </div>
      );
    }

    return <MovementsOnboardingEmpty canRegister={canManage} />;
  }

  const searchTerm = globalFilter.trim();
  const emptyMessage = searchTerm
    ? `Nada encontrado para '${searchTerm}'.`
    : 'Nada encontrado. Tente ajustar os filtros de tipo e período.';

  return (
    <DataTable
      tableOptions={tableOptions}
      renderSubRow={renderMovementsItems}
      emptyMessage={emptyMessage}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <DataTableTextFilter
            placeholder="Buscar por produto ou SKU"
            className="lg:max-w-[300px]"
          />
          <MovementsTypeTabs />
          <DataTableDateRangeFilter column="createdAt" />

          {canManage && (
            <Button size="sm" className="lg:ml-auto bg-green-950" asChild>
              <NavLink
                className="flex gap-2 justify-center items-center"
                to="/movements/new"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Registrar
              </NavLink>
            </Button>
          )}
        </div>

        {productId && <ProductFilterChip productName={productName} />}
      </div>

      <section className="my-2.5 border rounded-lg overflow-hidden">
        <DataTableContent />
      </section>

      <section className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          <b className="text-foreground">{data.length}</b>{' '}
          {productId
            ? data.length === 1
              ? 'movimentação deste produto'
              : 'movimentações deste produto'
            : data.length === 1
              ? 'movimentação'
              : 'movimentações'}
        </span>
        <PaginationControllers />
      </section>
    </DataTable>
  );
}

interface ProductFilterChipProps {
  productName?: string;
}

function ProductFilterChip({ productName }: ProductFilterChipProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        Filtrando por produto:
      </span>
      <Badge variant="secondary" className="gap-1.5 py-1 pl-2.5 pr-1.5">
        <span className="font-medium">Produto:</span>
        {productName || 'Produto selecionado'}
        <Link
          to="/movements"
          className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
          aria-label="Limpar filtro de produto"
        >
          <X className="h-3 w-3" />
        </Link>
      </Badge>
    </div>
  );
}
