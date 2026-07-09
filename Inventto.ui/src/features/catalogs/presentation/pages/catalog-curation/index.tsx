import { useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Input } from '@/shared/components/ui/input';
import { useIsMobile } from '@/shared/hooks/use-is-mobile';

import { AddProductsSheet } from '../../components/actions/add-products';
import { BackToCatalogsLink } from '../../components/actions/back-to-catalogs';
import { CurationProductGroup } from '../../components/curation-product-group';
import {
  useAvailableProductsQuery,
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
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');

  const { data: catalog } = useCatalogByIDQuery(catalogId);
  const { data: items, isLoading } = useCatalogItemsQuery(catalogId);
  const { data: availableProducts } = useAvailableProductsQuery(catalogId);

  const productGroups = useMemo(() => {
    if (!items) return [];

    const groupMap = new Map<
      string,
      { items: typeof items; product: (typeof items)[number]['product'] }
    >();

    for (const item of items) {
      const existing = groupMap.get(item.productId);
      if (existing) {
        existing.items.push(item);
      } else {
        groupMap.set(item.productId, {
          items: [item],
          product: item.product
        });
      }
    }

    return Array.from(groupMap.values());
  }, [items]);

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return productGroups;

    return productGroups.filter(
      ({ product }) =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term)
    );
  }, [productGroups, search]);

  const pendingCount = productGroups.filter(({ items: groupItems }) =>
    groupItems.some((item) => item.price <= 0)
  ).length;

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col gap-1.5 px-1 md:px-6 py-6">
        <BackToCatalogsLink />
        <h1 className="text-2xl font-semibold tracking-tight">
          Produtos — {catalog?.name ?? ''}
        </h1>
        <p className="text-sm text-muted-foreground">
          Escolha os produtos e defina preços. Clique em editar para alterar os
          preços.
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
            <AddProductsSheet catalogId={catalogId} iconOnly={isMobile} />
          </div>
        )}

        {pendingCount > 0 && (
          <div className="rounded-md border border-amber-400 bg-amber-50/40 px-4 py-2 text-sm text-amber-700 dark:bg-amber-950/10 dark:text-amber-500">
            {pendingCount === 1
              ? '1 produto recém-adicionado precisa de preço.'
              : `${pendingCount} produtos recém-adicionados precisam de preço.`}{' '}
            Itens sem preço de venda não entram no catálogo até serem
            preenchidos.
          </div>
        )}

        {isLoading ? (
          <CurationLoading />
        ) : !items || items.length === 0 ? (
          <CurationEmptyState catalogId={catalogId} />
        ) : filteredGroups.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nada encontrado para &quot;{search}&quot;.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredGroups.map(
              ({ items: groupItems, product: groupProduct }) => {
                const availableProduct = availableProducts?.find(
                  (p) => p.id === groupProduct.id
                );

                const productForDialog = availableProduct ?? {
                  id: groupProduct.id,
                  name: groupProduct.name,
                  sku: groupProduct.sku,
                  imageUrl: groupProduct.imageUrl,
                  alreadyAdded: true,
                  hasVariants:
                    groupItems.length > 1 || !!groupItems[0]?.variantId,
                  variants: groupItems
                    .filter((i) => !!i.variantId)
                    .map((i) => ({
                      id: i.variantId!,
                      sku: i.variant?.sku ?? '',
                      options: i.variant?.options ?? []
                    })),
                  costPrice: undefined
                };

                return (
                  <CurationProductGroup
                    key={groupProduct.id}
                    items={groupItems}
                    product={productForDialog}
                    catalogId={catalogId}
                  />
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}
