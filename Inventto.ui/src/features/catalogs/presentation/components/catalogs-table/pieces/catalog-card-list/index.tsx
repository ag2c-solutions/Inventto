import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Package, Search } from 'lucide-react';

import { Input } from '@/shared/components/ui/input';

import type { Catalog } from '../../../../../domain/entities';
import { EditCatalogSheet } from '../../../actions/edit';
import { RemoveCatalogDialog } from '../../../actions/remove';

interface CatalogCardListProps {
  catalogs: Catalog[];
}

export function CatalogCardList({ catalogs }: CatalogCardListProps) {
  const [search, setSearch] = useState('');

  const filteredCatalogs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return catalogs;

    return catalogs.filter((catalog) =>
      catalog.name.toLowerCase().includes(term)
    );
  }, [catalogs, search]);

  const searchTerm = search.trim();

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar catálogo por nome"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
        />
      </div>

      {filteredCatalogs.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {searchTerm
            ? `Nada encontrado para '${searchTerm}'.`
            : 'Nada encontrado.'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredCatalogs.map((catalog) => (
            <div
              key={catalog.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-3"
            >
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="font-medium text-foreground truncate">
                  {catalog.name}
                </span>
                <Link
                  to={`/catalogos/${catalog.id}/produtos`}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline w-fit"
                >
                  <Package className="h-3.5 w-3.5" />
                  {catalog.productsCount}{' '}
                  {catalog.productsCount === 1 ? 'produto' : 'produtos'}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {catalog.channelsCount > 0
                    ? `${catalog.channelsCount} canais vinculados`
                    : 'Nenhum canal'}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <EditCatalogSheet catalogId={catalog.id} />
                <RemoveCatalogDialog catalog={catalog} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
