import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { formatDecimalToInteger } from '@/shared/utils';

import type { VariantOption } from '@/features/products';
import { useProductsQuery } from '@/features/products';

import { CatalogApi } from '../../data/api';
import { CATALOG_KEYS } from '../constants';

export interface AvailableProductVariant {
  id: string;
  sku: string;
  options: VariantOption[];
  imageUrl?: string;
}

export interface AvailableProduct {
  id: string;
  name: string;
  sku: string;
  imageUrl?: string;
  alreadyAdded: boolean;
  hasVariants: boolean;
  variants: AvailableProductVariant[];
  /** Preço de custo do cadastro — usado como Smart Default no Dialog */
  costPrice?: number;
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

      const variants: AvailableProductVariant[] = product.hasVariants
        ? product.variants.map((v) => {
            const primaryVariantImage =
              v.images?.find((img) => img.isPrimary) ?? v.images?.[0];
            const imageUrl = primaryVariantImage
              ? product.allImages.find(
                  (img) => img.id === primaryVariantImage.id
                )?.url
              : undefined;

            return {
              id: v.id,
              sku: v.sku,
              options: v.options,
              imageUrl
            };
          })
        : [];

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        imageUrl: primaryImage?.url,
        alreadyAdded: addedProductIds.has(product.id),
        hasVariants: product.hasVariants,
        variants,
        // costPrice do cadastro de produtos vem em reais; o Smart Default
        // do Dialog de preços trabalha em centavos (mesma convenção do
        // domínio de CatalogItem).
        costPrice:
          product.costPrice != null
            ? formatDecimalToInteger(product.costPrice)
            : undefined
      };
    });
  }, [productsQuery.data, itemsQuery.data]);

  return {
    data,
    isLoading: productsQuery.isLoading || itemsQuery.isLoading
  };
}
