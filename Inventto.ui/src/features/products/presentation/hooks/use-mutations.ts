import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import type {
  CreateProduct,
  IProduct,
  UpdateProduct
} from '../../domain/entities';
import { ProductService } from '../../domain/services';
import { PRODUCTS_KEYS } from '../constants/query-keys';

type CreateProductMutationInput = Omit<CreateProduct, 'organizationId'>;
type UpdateProductMutationInput = Omit<UpdateProduct, 'organizationId'>;

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();

  return useMutation<IProduct, Error, CreateProductMutationInput>({
    mutationKey: ['products', 'create'],
    meta: {
      successMessage: 'Produto criado.'
    },
    mutationFn: (product) => ProductService.add(product, currentOrganization),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PRODUCTS_KEYS.all
      });
    }
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();

  return useMutation<IProduct, Error, UpdateProductMutationInput>({
    mutationKey: ['products', 'update'],
    meta: {
      successMessage: 'Produto atualizado com sucesso!'
    },
    mutationFn: (product) =>
      ProductService.update(product, currentOrganization),
    onSuccess: (product) => {
      queryClient.invalidateQueries({
        queryKey: PRODUCTS_KEYS.all
      });

      queryClient.invalidateQueries({
        queryKey: PRODUCTS_KEYS.detail(product.id)
      });
    }
  });
}
