import { useCallback, useMemo, useState } from 'react';
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
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import {
  DataTable,
  DataTableContent,
  DataTableDateRangeFilter,
  DataTableTextFilter,
  PaginationControllers
} from '@/shared/components/common/data-table';
import { DataTableTabFilter } from '@/shared/components/common/data-table/pieces/data-table-tabs-filter';
import { useIsMobile } from '@/shared/hooks/use-is-mobile';

import type { Movement } from '../../../domain/entities';
import { AddNewMovements } from '../add-moviment';
import { MovementDetails } from '../details';
import { ProductFilterChip } from '../filter-chip';

import {
  matchesProductSearch,
  resolveProductNameById
} from './utils/matches-product-search';
import { columnsMovementsListTable } from './columns';
import { MovementsListTableLoading } from './loading';
import { MovementCardList } from './movement-card-list';
import { MovementsOnboardingEmpty } from './onboarding-empty';

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
  const isMobile = useIsMobile();
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

    return <MovementsOnboardingEmpty />;
  }

  if (isMobile) {
    return (
      <MovementCardList
        movements={data}
        productId={productId}
        productName={productName}
      />
    );
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
        {productId && <ProductFilterChip productName={productName} />}

        <div className="flex w-full lg:items-center justify-between">
          <div className="flex flex-col lg:flex-row lg:items-center w-full gap-3">
            <DataTableTextFilter
              placeholder="Buscar por produto ou SKU"
              className="lg:max-w-[360px]"
            />
            <DataTableTabFilter
              column="type"
              initialValue={'all'}
              options={[
                { Icon: ArrowUpDown, value: 'all', label: 'Todos' },
                { Icon: ArrowUp, value: 'entry', label: 'Entradas' },
                { Icon: ArrowDown, value: 'withdrawal', label: 'Saídas' }
              ]}
            />
            <DataTableDateRangeFilter column="createdAt" />
          </div>

          <AddNewMovements />
        </div>
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
