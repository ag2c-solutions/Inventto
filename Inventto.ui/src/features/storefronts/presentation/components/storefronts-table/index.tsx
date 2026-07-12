import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table';

import {
  DataTable,
  DataTableContent,
  DataTableTextFilter,
  PaginationControllers
} from '@/shared/components/common/data-table';
import { Button } from '@/shared/components/ui/button';

import type { Storefront } from '../../../domain/entities';
import { StorefrontsEmptyState } from '../storefronts-empty';
import { StorefrontsLoading } from '../storefronts-loading';

import { getStorefrontsTableColumns } from './columns';

interface StorefrontsTableProps {
  data: Storefront[];
  isLoading: boolean;
}

export function StorefrontsTable({ data, isLoading }: StorefrontsTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo(() => getStorefrontsTableColumns(), []);

  const tableOptions = {
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: { columnFilters }
  };

  if (isLoading) {
    return <StorefrontsLoading />;
  }

  if (data.length === 0) {
    return <StorefrontsEmptyState />;
  }

  const nameFilter = columnFilters.find((filter) => filter.id === 'name')
    ?.value as string | undefined;
  const emptyMessage = nameFilter
    ? `Nada encontrado para '${nameFilter}'.`
    : 'Nada encontrado.';

  return (
    <DataTable tableOptions={tableOptions} emptyMessage={emptyMessage}>
      <div className="flex w-full items-center justify-between gap-3">
        <DataTableTextFilter
          column="name"
          placeholder="Buscar vitrine por nome"
          className="max-w-[320px]"
        />

        <Button asChild>
          <Link to="/storefronts/novo">Criar vitrine</Link>
        </Button>
      </div>

      <div className="my-2.5 overflow-hidden rounded-lg border">
        <DataTableContent />
      </div>

      <PaginationControllers />
    </DataTable>
  );
}
