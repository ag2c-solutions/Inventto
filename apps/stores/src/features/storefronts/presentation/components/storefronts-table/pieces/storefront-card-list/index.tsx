import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Plus, Search } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

import type { Storefront } from '../../../../../domain/entities';
import { CatalogCell } from '../catalog-cell';
import { RowActionsMenu } from '../row-actions-menu';
import { StateBadge } from '../state-badge';
import { StorefrontNameCell } from '../storefront-name-cell';

interface StorefrontCardListProps {
  storefronts: Storefront[];
}

export function StorefrontCardList({ storefronts }: StorefrontCardListProps) {
  const [search, setSearch] = useState('');

  const filteredStorefronts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return storefronts;

    return storefronts.filter((storefront) =>
      storefront.name.toLowerCase().includes(term)
    );
  }, [storefronts, search]);

  const searchTerm = search.trim();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vitrine por nome"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        <Button asChild size="icon" aria-label="Criar vitrine">
          <Link to="/storefronts/novo">
            <Plus className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {filteredStorefronts.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {searchTerm
            ? `Nada encontrado para '${searchTerm}'.`
            : 'Nada encontrado.'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredStorefronts.map((storefront) => (
            <div
              key={storefront.id}
              className="flex flex-col gap-3 rounded-lg border bg-card p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <StorefrontNameCell storefront={storefront} />
                <RowActionsMenu storefront={storefront} />
              </div>

              <div className="flex items-center justify-between gap-2">
                <StateBadge state={storefront.state} />
                <CatalogCell catalogName={storefront.catalogName} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
