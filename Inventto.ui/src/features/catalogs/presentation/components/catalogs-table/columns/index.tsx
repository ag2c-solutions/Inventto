import { Link } from 'react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { Package, Trash2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import type { Catalog } from '../../../../domain/entities';
import { EditCatalogSheet } from '../../actions/edit';

interface GetCatalogsTableColumnsOptions {
  canManage: boolean;
}

export function getCatalogsTableColumns({
  canManage
}: GetCatalogsTableColumnsOptions): ColumnDef<Catalog>[] {
  const columns: ColumnDef<Catalog>[] = [
    {
      accessorKey: 'name',
      header: 'Catálogo',
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.name}</span>
      )
    },
    {
      id: 'productsCount',
      accessorKey: 'productsCount',
      header: 'Produtos',
      cell: ({ row }) => (
        <Link
          to={`/catalogos/${row.original.id}/produtos`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          <Package className="h-3.5 w-3.5" />
          {row.original.productsCount}
        </Link>
      )
    },
    {
      id: 'channelsCount',
      accessorKey: 'channelsCount',
      header: 'Canais vinculados',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.channelsCount > 0
            ? `${row.original.channelsCount} canais`
            : 'Nenhum'}
        </span>
      )
    }
  ];

  if (canManage) {
    columns.push({
      id: 'actions',
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <EditCatalogSheet catalogId={row.original.id} />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            title="Remover catálogo"
            className="hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remover catálogo</span>
          </Button>
        </div>
      )
    });
  }

  return columns;
}
