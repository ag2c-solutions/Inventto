import { useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Input } from '@/shared/components/ui/input';

import { AddProductsSheet } from '../../components/add-products-sheet';
import { CurationItem } from '../../components/curation-item';
import {
  useCatalogByIDQuery,
  useCatalogItemsQuery
} from '../../hooks/use-queries';

import { CurationEmptyState } from './pieces/empty';
import { CurationLoading } from './pieces/loading';

interface CatalogCurationParams {
  [key: string]: string | undefined;
  catalogId: string;
}

export function CatalogCurationPage() {
  const { catalogId: catalogIdParam } = useParams<CatalogCurationParams>();
  const catalogId = catalogIdParam ?? '';
  const [search, setSearch] = useState('');

  const { data: catalog } = useCatalogByIDQuery(catalogId);
  const { data: items, isLoading } = useCatalogItemsQuery(catalogId);

  const filteredItems = useMemo(() => {
    if (!items) return [];

    const term = search.trim().toLowerCase();
    if (!term) return items;

    return items.filter(
      (item) =>
        item.product.name.toLowerCase().includes(term) ||
        item.product.sku.toLowerCase().includes(term)
    );
  }, [items, search]);

  const pendingCount = (items ?? []).filter((item) => item.price <= 0).length;

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col gap-1.5 px-1 md:px-6 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Produtos — {catalog?.name ?? ''}
        </h1>
        <p className="text-sm text-muted-foreground">
          Escolha os produtos e defina preços. Mudanças de preço salvam
          automaticamente.
        </p>
      </div>

      <div className="px-1 md:px-6 pb-6 flex-1 flex flex-col gap-4">
        {!isLoading && items && items.length > 0 && (
          <div className="flex items-center justify-between gap-3">
            <Input
              placeholder="Buscar produto ou SKU neste catálogo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-[320px]"
            />
            <AddProductsSheet catalogId={catalogId} />
          </div>
        )}

        {pendingCount > 0 && (
          <div className="rounded-md border border-amber-400 bg-amber-50/40 px-4 py-2 text-sm text-amber-700 dark:bg-amber-950/10 dark:text-amber-500">
            {pendingCount === 1
              ? '1 item recém-adicionado precisa de preço.'
              : `${pendingCount} itens recém-adicionados precisam de preço.`}{' '}
            Itens sem preço de venda não entram no catálogo até serem
            preenchidos.
          </div>
        )}

        {isLoading ? (
          <CurationLoading />
        ) : !items || items.length === 0 ? (
          <CurationEmptyState catalogId={catalogId} />
        ) : filteredItems.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nada encontrado para &quot;{search}&quot;.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredItems.map((item) => (
              <CurationItem key={item.id} item={item} catalogId={catalogId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
