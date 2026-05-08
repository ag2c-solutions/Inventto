import { useQuery } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { ProductAPI } from '../../data/api';
import { ProductService } from '../../domain/service';

export const PRODUCTS_KEYS = {
  all: ['products'] as const,
  list: (organizationId?: string | null) =>
    [...PRODUCTS_KEYS.all, 'list', organizationId] as const,
  detail: (productId?: string | null) =>
    [...PRODUCTS_KEYS.all, 'detail', productId] as const,
  globalAttributes: ['products', 'global-attributes'] as const
};

export function useProductsQuery() {
  const { currentOrganization: organization, role } = useUser();
  const organizationId = organization?.id;

  return useQuery({
    queryKey: PRODUCTS_KEYS.list(organizationId),
    queryFn: () => ProductService.getAll(organizationId, role),
    enabled: !!organizationId && !!role,
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
