import { useState } from 'react';
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState
} from '@tanstack/react-table';

import {
  DataTable,
  DataTableContent,
  DataTableSelectFilter,
  DataTableTextFilter,
  PaginationControllers
} from '@/shared/components/common/data-table';

import { useUser } from '@/features/users';

import { useOrganizationMembersQuery } from '../../hooks/use-queries';
import { AddMember } from '../add-member';

import { columns } from './columns';
import { MembersTableSkeleton } from './skeleton';

export function MembersListTable() {
  const { isLoading: isLoadingOrg } = useUser();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const { data: members = [], isLoading: isLoadingMembers } =
    useOrganizationMembersQuery();

  const tableOptions = {
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter
    }
  };

  if (isLoadingOrg || isLoadingMembers) {
    return <MembersTableSkeleton />;
  }

  const emptyMessage = globalFilter
    ? `Nenhum membro encontrado para "${globalFilter}".`
    : 'Nenhum membro encontrado.';

  return (
    <div className="space-y-4">
      <DataTable
        tableOptions={tableOptions}
        emptyMessage={emptyMessage}
        getRowClassName={(row) =>
          row.original.status === 'inactive' ? 'opacity-60' : undefined
        }
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 items-center gap-2">
            <DataTableTextFilter
              placeholder="Buscar membros por nome ou e-mail"
              className="max-w-[300px]"
            />

            <DataTableSelectFilter
              column="role"
              placeholder="Função"
              options={[
                { label: 'Todas as funções', value: 'all' },
                { label: 'Dono', value: 'owner' },
                { label: 'Gerente', value: 'manager' },
                { label: 'Vendedor', value: 'sales' }
              ]}
            />
            <DataTableSelectFilter
              column="status"
              placeholder="Status"
              options={[
                { label: 'Todos os status', value: 'all' },
                { label: 'Ativo', value: 'active' },
                { label: 'Inativo', value: 'inactive' },
                { label: 'Convidado', value: 'invited' }
              ]}
            />
          </div>
          <AddMember />
        </div>

        <div className="rounded-md border bg-card overflow-hidden">
          <DataTableContent />
        </div>

        <PaginationControllers />
      </DataTable>
    </div>
  );
}
