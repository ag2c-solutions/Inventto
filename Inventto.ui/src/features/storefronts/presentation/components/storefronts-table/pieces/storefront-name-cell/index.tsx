import { Store } from 'lucide-react';

import type { Storefront } from '../../../../../domain/entities';

interface StorefrontNameCellProps {
  storefront: Storefront;
}

export function StorefrontNameCell({ storefront }: StorefrontNameCellProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar/70 text-muted-foreground">
        <Store className="h-4 w-4" />
      </div>
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{storefront.name}</span>
        <span
          className={
            storefront.publicUrl
              ? 'font-mono text-xs text-muted-foreground'
              : 'text-xs italic text-muted-foreground/70'
          }
        >
          {storefront.publicUrl ?? 'sem endereço'}
        </span>
      </div>
    </div>
  );
}
