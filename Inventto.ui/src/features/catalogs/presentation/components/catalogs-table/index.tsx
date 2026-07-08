import { useMemo, useState } from 'react';
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

import { usePermission } from '@/features/permissions';

import type { Catalog } from '../../../domain/entities';
import { CreateCatalogDialog } from '../actions/create';

import { CatalogsEmptyState } from './pieces/empty';
import { CatalogsTableLoading } from './pieces/loading';
import { getCatalogsTableColumns } from './columns';

interface CatalogsTableProps {
  data: Catalog[];
  isLoading: boolean;
}

export function CatalogsTable({ data, isLoading }: CatalogsTableProps) {
  const { can } = usePermission();
  const canManage = can('catalog:manage');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo(
    () => getCatalogsTableColumns({ canManage }),
    [canManage]
  );

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
    return <CatalogsTableLoading />;
  }

  if (data.length === 0) {
    return <CatalogsEmptyState />;
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
          placeholder="Buscar catálogo por nome"
          className="max-w-[320px]"
        />

        <CreateCatalogDialog />
      </div>

      <div className="my-2.5 rounded-lg border overflow-hidden">
        <DataTableContent />
      </div>

      <PaginationControllers />
    </DataTable>
  );
}
