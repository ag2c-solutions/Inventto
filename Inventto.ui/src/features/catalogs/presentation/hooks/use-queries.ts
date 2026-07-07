import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useProductsQuery } from '@/features/products';

import { CatalogApi } from '../../data/api';
import { CATALOG_KEYS } from '../constants';

export interface AvailableProduct {
  id: string;
  name: string;
  sku: string;
  imageUrl?: string;
  alreadyAdded: boolean;
}

export function useCatalogsQuery() {
  return useQuery({
    queryKey: CATALOG_KEYS.all,
    queryFn: CatalogApi.getAll,
    staleTime: 1000 * 60 * 5
  });
}

export function useCatalogByIDQuery(id: string) {
  return useQuery({
    queryKey: CATALOG_KEYS.detail(id),
    queryFn: () => CatalogApi.getOneById(id),
    enabled: !!id
  });
}

export function useCatalogItemsQuery(catalogId: string) {
  return useQuery({
    queryKey: CATALOG_KEYS.items(catalogId),
    queryFn: () => CatalogApi.getItems(catalogId),
    enabled: !!catalogId
  });
}

export function useAvailableProductsQuery(catalogId: string): {
  data: AvailableProduct[] | undefined;
  isLoading: boolean;
} {
  const productsQuery = useProductsQuery();
  const itemsQuery = useCatalogItemsQuery(catalogId);

  const data = useMemo(() => {
    if (!productsQuery.data) return undefined;

    const addedProductIds = new Set(
      (itemsQuery.data ?? []).map((item) => item.productId)
    );

    return productsQuery.data.map((product) => {
      const primaryImage =
        product.allImages.find((image) => image.isPrimary) ??
        product.allImages[0];

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        imageUrl: primaryImage?.url,
        alreadyAdded: addedProductIds.has(product.id)
      };
    });
  }, [productsQuery.data, itemsQuery.data]);

  return {
    data,
    isLoading: productsQuery.isLoading || itemsQuery.isLoading
  };
}
