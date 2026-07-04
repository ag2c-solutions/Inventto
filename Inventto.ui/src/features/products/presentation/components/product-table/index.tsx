import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  type ColumnFiltersState,
  type ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type TableOptions
} from '@tanstack/react-table';
import { Download, PlusCircle } from 'lucide-react';

import {
  DataTable,
  DataTableContent,
  DataTableSelectFilter,
  DataTableTextFilter,
  PaginationControllers
} from '@/shared/components/common/data-table';
import { useIsMobile } from '@/shared/hooks/use-is-mobile';

import { ActionButton } from '@/features/permissions';

import type { IProduct } from '../../../domain/entities';
import { STATUS_FILTER_OPTIONS } from '../../constants/status-filter-options';
import { useProductsQuery } from '../../hooks/use-queries';
import { ProductVariantsCard } from '../variants-card';

import { columnsProductListTable } from './columns';
import { ProductListTableLoading } from './loading';
import { ProductListOnboardingEmpty } from './onboarding-empty';
import { ProductCardList } from './product-card-list';

export function ProductListTable() {
  const isMobile = useIsMobile();
  const { data: products, isLoading } = useProductsQuery();
  const [isExpanded, setIsExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const categoryOptions = useMemo(() => {
    const unique = new Map<string, string>();

    (products ?? []).forEach((product) => {
      product.categories.forEach((category) => {
        unique.set(category.id, category.name);
      });
    });

    return [
      { value: 'all', label: 'Todas as categorias' },
      ...Array.from(unique, ([value, label]) => ({ value, label }))
    ];
  }, [products]);

  const tableOptions: TableOptions<IProduct> = useMemo(() => {
    return {
      columns: columnsProductListTable,
      data: products ?? [],
      columnResizeMode: 'onChange',
      state: {
        expanded: isExpanded,
        globalFilter,
        columnFilters
      },
      onExpandedChange: setIsExpanded,
      onGlobalFilterChange: setGlobalFilter,
      onColumnFiltersChange: setColumnFilters,
      getCoreRowModel: getCoreRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel()
    };
  }, [products, isExpanded, globalFilter, columnFilters]);

  const renderVariantsDetails = useCallback((row: Row<IProduct>) => {
    if (!row.original.hasVariants || !row.original.variants.length) {
      return null;
    }

    return (
      <ProductVariantsCard
        variants={row.original.variants ?? []}
        productImages={row.original.allImages}
      />
    );
  }, []);

  const getRowClassName = useCallback(
    (row: Row<IProduct>) => (row.original.isActive ? undefined : 'opacity-50'),
    []
  );

  if (isLoading) {
    return <ProductListTableLoading />;
  }

  if (!products || products.length === 0) {
    return <ProductListOnboardingEmpty />;
  }

  if (isMobile) {
    return (
      <ProductCardList products={products} categoryOptions={categoryOptions} />
    );
  }

  const searchTerm = globalFilter.trim();
  const emptyMessage = searchTerm
    ? `Nada encontrado para '${searchTerm}'.`
    : 'Nada encontrado. Tente ajustar os filtros de categoria e status.';

  return (
    <DataTable
      tableOptions={tableOptions}
      renderSubRow={renderVariantsDetails}
      getRowClassName={getRowClassName}
      emptyMessage={emptyMessage}
    >
      <div className="flex flex-col lg:flex-row gap-4 items-start justify-between">
        <section className="flex flex-1 flex-col sm:flex-row gap-4">
          <DataTableTextFilter
            placeholder="Buscar por nome ou SKU"
            className="max-w-[300px]"
          />
          <DataTableSelectFilter
            placeholder="Todas as categorias"
            column="category"
            options={categoryOptions}
          />
          <DataTableSelectFilter
            placeholder="Todos os status"
            column="status"
            options={STATUS_FILTER_OPTIONS}
          />
        </section>

        <section className="gap-3 md:pl-4 flex items-center">
          <ActionButton
            action="product:create"
            size="sm"
            variant="outline"
            className="cursor-pointer"
            asChild
          >
            <Link className="flex gap-2 items-center" to="/products/import">
              <Download className="h-4 w-4" />
              Importar
            </Link>
          </ActionButton>

          <ActionButton
            action="product:create"
            size="sm"
            className="bg-green-950 cursor-pointer"
            asChild
          >
            <Link className="flex gap-2 items-center" to="/products/create">
              <PlusCircle className="h-4 w-4" />
              Cadastrar produto
            </Link>
          </ActionButton>
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
