import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useUser } from '../../users/hooks/use-user';
import { ProductService } from '../service';
import type { IProduct } from '../types';

export function useProductsQuery() {
  const { organization, role } = useUser();
  const organizationId = organization?.id;

  return useQuery({
    queryKey: ['products', organizationId],
    queryFn: () => ProductService.getAll(organizationId, role),
    staleTime: 1000 * 60 * 5
  });
}

export function useProductByIDQuery(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: ({ queryKey }: { queryKey: ['product', string] }) =>
      ProductService.getOneById(queryKey[1])
  });
}

export function useGlobalAttributesQuery() {
  return useQuery({
    queryKey: ['global-attributes'],
    queryFn: ProductService.getGlobalAttributes,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  const { organization } = useUser();
  const organizationId = organization?.id;

  return useMutation({
    mutationFn: (data: Omit<IProduct, 'organizationId' | 'id'>) => {
      if (!organizationId) throw new Error('Nenhuma organização selecionada.');

      return ProductService.add({ ...data, organizationId } as IProduct);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}
export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  const { organization } = useUser();
  const organizationId = organization?.id;

  return useMutation({
    mutationFn: (data: IProduct) => {
      if (!organizationId) throw new Error('Nenhuma organização selecionada.');

      return ProductService.update({ ...data, organizationId });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.id] });
    }
  });
}
