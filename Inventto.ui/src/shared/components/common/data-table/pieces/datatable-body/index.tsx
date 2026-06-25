import { Fragment, memo } from 'react';
import { flexRender } from '@tanstack/react-table';
import { SearchIcon } from 'lucide-react';

import { TableBody, TableCell, TableRow } from '@/shared/components/ui/table';

import { useDataTable } from '../../hook/use-data-table';

export function DataTableBody() {
  const { table, emptyMessage, renderSubRow, getRowClassName } = useDataTable();

  return (
    <TableBody>
      {table.getRowModel().rows.length > 0 ? (
        table.getRowModel().rows.map((row, index) => (
          <Fragment key={`table-row-${row?.id}-${index}`}>
            <TableRow className={getRowClassName?.(row)}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
            {renderSubRow && row.getIsExpanded() && (
              <TableRow key={row.id} className="bg-sidebar">
                <TableCell
                  colSpan={row.getVisibleCells().length}
                  className="px-0 bg-sidebar"
                >
                  {renderSubRow(row, index)}
                </TableCell>
              </TableRow>
            )}
          </Fragment>
        ))
      ) : (
        <TableRow>
          <TableCell
            colSpan={table.getAllColumns().length}
            className="py-12 text-muted-foreground"
          >
            <div className="w-full flex flex-col items-center justify-center">
              <div className="flex h-15 w-15 rounded-full bg-sidebar/70 items-center justify-center gap-2 text-center">
                <SearchIcon className="h-6 w-6 text-muted-foreground/60" />
              </div>
              <h4 className="text-lg font-semibold text-sidebar-foreground mt-2">
                Nenhum resultado encontrado
              </h4>
              <p className="text-muted-foreground mt-1">
                {emptyMessage || 'Nenhum registro disponível.'}
              </p>
            </div>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}

export const MemoizedDataTableBody = memo(DataTableBody);
