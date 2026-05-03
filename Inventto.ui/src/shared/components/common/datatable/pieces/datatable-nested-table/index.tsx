import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableRow
} from '@/shared/components/ui/table';

import { useDataTable } from '../../hook/usetable';

interface TNestedDataTable<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];

  parentData?: any;
}

export function NestedDataTable<TData>({
  data,
  columns,
  parentData
}: TNestedDataTable<TData>) {
  const { table } = useDataTable();
  const parentColumnsVisible = table
    .getVisibleFlatColumns()
    .map((col) => col.id);

  const nestedTable = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      parentData: parentData
    }
  });

  return (
    <Table>
      <TableBody>
        {nestedTable.getRowModel().rows.map((row, index) => (
          <TableRow key={`${row.id}-${index}-${row.parentId}`}>
            {row.getVisibleCells().map((cell, idx) => {
              return (
                parentColumnsVisible.includes(cell.column.id) && (
                  <TableCell
                    key={`${cell.id}-${row.id}-${index}-${idx}`}
                    style={{
                      width: `calc(var(--th-${cell.column.id}-size) * 1px)`
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                )
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
