import { useCallback, useMemo, useState } from 'react';
import { columnsProductListTable } from './columns';
import { productVariantsTableColumns } from '../product-variants-table/columns';
import type { IProduct } from '../../types/models';

import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ExpandedState,
  type Row,
  type TableOptions
} from '@tanstack/react-table';

import {
  DataTable,
  DataTableContent,
  DataTableDropdownColumnsVisibility,
  DataTableTextFilter,
  NestedDataTable,
  PaginationControllers
} from '@/app/components/shared/datatable';
import { useProductsQuery } from '../../hooks/use-query';
import { ActionButton } from '@/app/features/permissions/components/action-button';
import { Link } from 'react-router';
import { PlusCircle } from 'lucide-react';

export function ProductListTable() {
  const { data: products } = useProductsQuery();
  const [isExpanded, setIsExpanded] = useState<ExpandedState>({});

  const tableOptions: TableOptions<IProduct> = useMemo(() => {
    return {
      columns: columnsProductListTable,
      data: products || [],
      columnResizeMode: 'onChange',
      state: {
        expanded: isExpanded
      },
      onExpandedChange: setIsExpanded,
      getCoreRowModel: getCoreRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel()
    };
  }, [products, isExpanded]);

  const renderVariantsDetails = useCallback(
    (row: Row<IProduct>, index: number) => {
      return (
        <NestedDataTable
          key={`table-variants-${row.original.sku}-${index}`}
          data={row.original.variants || []}
          columns={productVariantsTableColumns}
          parentData={row.original}
        />
      );
    },
    []
  );

  return (
    <DataTable
      tableOptions={tableOptions}
      renderSubRow={renderVariantsDetails}
      emptyMessage="Nenhum produto foi encontrado."
    >
      <div className="flex flex-col lg:flex-row gap-4 items-start justify-between">
        <section className="flex flex-1 flex-col sm:flex-row gap-4">
          <DataTableTextFilter
            placeholder="Digite Nome ou SKU do produto"
            className="max-w-[300px]"
          />
        </section>
        <section className="gap-2 md:pl-4 flex items-center">
          <DataTableDropdownColumnsVisibility />
          <div className="flex w-full md:w-[unset] gap-3">
            <ActionButton
              action="product:create"
              size={'sm'}
              className="bg-green-950 cursor-pointer w-full"
            >
              <Link className="flex gap-2 items-center" to="create">
                <PlusCircle />
                Adicionar Produto
              </Link>
            </ActionButton>
          </div>
        </section>
      </div>
      <section className="my-2.5 border-2 rounded-lg overflow-hidden">
        <DataTableContent />
      </section>
      <section className="w-full">
        <PaginationControllers />
      </section>
    </DataTable>
  );
}
