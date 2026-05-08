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
import { PlusCircle } from 'lucide-react';

import { ActionButton } from '@/features/permissions';

import {
  DataTable,
  DataTableContent,
  DataTableDropdownColumnsVisibility,
  DataTableTextFilter,
  NestedDataTable,
  PaginationControllers
} from '@/shared/components/common/datatable';

import type { IProduct } from '../../../domain/entities';
import { useProductsQuery } from '../../hooks/use-query';
import { productVariantsTableColumns } from '../variants-table/columns';

import { columnsProductListTable } from './columns';

export function ProductListTable() {
  const { data: products } = useProductsQuery();
  const [isExpanded, setIsExpanded] = useState<ExpandedState>({});

  const tableOptions: TableOptions<IProduct> = useMemo(() => {
    return {
      columns: columnsProductListTable,
      data: products ?? [],
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

  const renderVariantsDetails = useCallback((row: Row<IProduct>) => {
    if (!row.original.hasVariants || !row.original.variants.length) {
      return null;
    }

    return (
      <NestedDataTable
        key={`table-variants-${row.original.id}`}
        data={row.original.variants ?? []}
        columns={productVariantsTableColumns}
        parentData={row.original}
      />
    );
  }, []);

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
              <Link className="flex gap-2 items-center" to="/products/create">
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
