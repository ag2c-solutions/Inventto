import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUser } from '@/features/users/hooks/use-user';

import { ProductService } from '../../domain/services/product-service';
import type { IProduct } from '../../types';

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
