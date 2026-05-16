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
