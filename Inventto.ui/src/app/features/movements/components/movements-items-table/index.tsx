import { memo } from 'react';
import type { TableMeta } from '@tanstack/react-table';
import { SimpleDataTable } from '@/app/components/shared/simple-data-table';
import { columnsMovementsItemsTable } from './columns';
import type { Movement, MovementItem } from '../../types';

type MovementsItemsTableProps = {
  data: MovementItem[];
  parentData: Movement;
};

export function MovementsItemsTable({
  data,
  parentData
}: MovementsItemsTableProps) {
  const meta: TableMeta<MovementItem> = {
    parentData: parentData
  };

  return (
    <SimpleDataTable
      data={data}
      columns={columnsMovementsItemsTable}
      meta={meta}
    />
  );
}

export const MemoizeMovementsItemsTable = memo(MovementsItemsTable);