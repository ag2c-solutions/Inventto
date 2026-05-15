import { memo } from 'react';
import type { TableMeta } from '@tanstack/react-table';

import { SimpleDataTable } from '@/shared/components/common/simple-data-table';

import type { Movement, MovementItem } from '../../../domain/entities';

import { columnsMovementsItemsTable } from './columns';

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
