import type { ColumnDef } from '@tanstack/react-table';

import type { Storefront } from '../../../../domain/entities';
import { CatalogCell } from '../pieces/catalog-cell';
import { RowActionsMenu } from '../pieces/row-actions-menu';
import { StateBadge } from '../pieces/state-badge';
import { StorefrontNameCell } from '../pieces/storefront-name-cell';

export function getStorefrontsTableColumns(): ColumnDef<Storefront>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Vitrine',
      cell: ({ row }) => <StorefrontNameCell storefront={row.original} />
    },
    {
      id: 'catalogName',
      accessorKey: 'catalogName',
      header: 'Catálogo',
      cell: ({ row }) => <CatalogCell catalogName={row.original.catalogName} />
    },
    {
      id: 'state',
      accessorKey: 'state',
      header: 'Estado',
      cell: ({ row }) => <StateBadge state={row.original.state} />
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <RowActionsMenu storefront={row.original} />
        </div>
      )
    }
  ];
}
