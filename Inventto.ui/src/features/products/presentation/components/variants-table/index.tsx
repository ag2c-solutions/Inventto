import { memo, useMemo } from 'react';
import type { TableMeta } from '@tanstack/react-table';

import { SimpleDataTable } from '@/shared/components/common/simple-data-table';

import type { IProductVariant } from '../../../domain/entities';

import { productVariantsTableColumns } from './columns';

type ProductVariantsTableProps<TParent> = {
  data: IProductVariant[];
  parentData: TParent;
};

function ProductVariantsTableComponent<TParent>({
  data,
  parentData
}: ProductVariantsTableProps<TParent>) {
  const meta = useMemo<TableMeta<TParent>>(
    () => ({
      parentData
    }),
    [parentData]
  );

  return (
    <SimpleDataTable
      data={data}
      columns={productVariantsTableColumns}
      meta={meta}
    />
  );
}

export const ProductVariantsTable = memo(
  ProductVariantsTableComponent
) as typeof ProductVariantsTableComponent;
