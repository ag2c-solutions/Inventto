import {
  type Row,
  type TableOptions,
  useReactTable
} from '@tanstack/react-table';
import type { ReactNode } from 'react';

import { DataTableContext } from '../../hook/use-data-table';

export interface IDataTable<TData> {
  tableOptions: TableOptions<TData>;
  emptyMessage?: string;
  renderSubRow?: (row: Row<TData>, index: number) => ReactNode;
  getRowClassName?: (row: Row<TData>) => string | undefined;
  children?: ReactNode;
}
export function DataTable<TData>({
  tableOptions,
  emptyMessage,
  renderSubRow,
  getRowClassName,
  children
}: IDataTable<TData>) {
  const table = useReactTable(tableOptions);

  return (
    <DataTableContext.Provider
      value={{ table, renderSubRow, emptyMessage, getRowClassName } as never}
    >
      {children}
    </DataTableContext.Provider>
  );
}
