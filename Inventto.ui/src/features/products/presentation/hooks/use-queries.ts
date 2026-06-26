import { useQuery } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { ProductAPI } from '../../data/api';
import { ProductService } from '../../domain/services';
import { PRODUCTS_KEYS } from '../constants/query-keys';

export function useProductsQuery() {
  const { currentOrganization, role } = useUser();

  return useQuery({
    queryKey: PRODUCTS_KEYS.list(currentOrganization?.id),
    queryFn: () => ProductService.getAll(currentOrganization, role),
    enabled: !!currentOrganization && !!role,
    staleTime: 1000 * 60 * 5
  });
}

export function useProductByIDQuery(productId?: string) {
  return useQuery({
    queryKey: PRODUCTS_KEYS.detail(productId),
    queryFn: () => ProductService.getOneById(productId),
    enabled: !!productId
  });
}

export function useSkuAvailabilityQuery(params: {
  sku: string;
  excludeProductId?: string;
  enabled?: boolean;
}) {
  const { sku, excludeProductId, enabled = true } = params;
  const { currentOrganization } = useUser();

  const normalizedSku = sku.trim();

  return useQuery({
    queryKey: PRODUCTS_KEYS.skuAvailability(
      currentOrganization?.id,
      normalizedSku,
      excludeProductId
    ),
    queryFn: () =>
      ProductAPI.checkSkuAvailability({
        organizationId: currentOrganization!.id,
        sku: normalizedSku,
        excludeProductId
      }),
    enabled: enabled && !!currentOrganization?.id && normalizedSku.length > 0,
    staleTime: 1000 * 30,
    retry: false
  });
}

export function useGlobalAttributesQuery() {
  return useQuery({
    queryKey: PRODUCTS_KEYS.globalAttributes,
    queryFn: () => ProductAPI.getGlobalAttributes(),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
}

export function useProductMovementsQuery(productId?: string) {
  return useQuery({
    queryKey: PRODUCTS_KEYS.detail(productId).concat(['movements']),
    queryFn: () => ProductService.checkHasMovements(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5
  });
}
