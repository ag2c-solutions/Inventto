import { BookOpen } from 'lucide-react';

import { CreateCatalogDialog } from '../../../create-catalog-dialog';

export function CatalogsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sidebar/70">
        <BookOpen className="h-7 w-7 text-muted-foreground/70" />
      </div>

      <h3 className="text-lg font-semibold">Nenhum catálogo ainda.</h3>

      <p className="max-w-md text-sm text-muted-foreground">
        Crie um catálogo para definir o que você vende e por quanto.
      </p>

      <CreateCatalogDialog />
    </div>
  );
}
