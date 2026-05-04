import { useQuery } from '@tanstack/react-query';

import { useUser } from '@/features/users/hooks/use-user';

import { ProductAPI } from '../../data/api/product-api';

export function useProductsQuery() {
  const { organization, role } = useUser();
  const organizationId = organization?.id;

  return useQuery({
    queryKey: ['products', organizationId],
    queryFn: () => ProductAPI.getAll(organizationId, role),
    staleTime: 1000 * 60 * 5
  });
}

export function useProductByIDQuery(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: ({ queryKey }: { queryKey: ['product', string] }) =>
      ProductAPI.getOneById(queryKey[1])
  });
}

export function useGlobalAttributesQuery() {
  return useQuery({
    queryKey: ['global-attributes'],
    queryFn: ProductAPI.getGlobalAttributes,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
}
