import { Package } from 'lucide-react';

import { AddProductsSheet } from '../../../../components/add-products-sheet';

interface CurationEmptyStateProps {
  catalogId: string;
}

export function CurationEmptyState({ catalogId }: CurationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sidebar/70">
        <Package className="h-7 w-7 text-muted-foreground/70" />
      </div>

      <h3 className="text-lg font-semibold">Nenhum produto neste catálogo.</h3>

      <p className="max-w-md text-sm text-muted-foreground">
        Adicione produtos a este catálogo.
      </p>

      <AddProductsSheet catalogId={catalogId} />
    </div>
  );
}
