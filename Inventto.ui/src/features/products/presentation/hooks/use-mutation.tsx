import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import type {
  CreateProduct,
  IProduct,
  UpdateProduct
} from '../../domain/entities';
import { ProductService } from '../../domain/service';

import { PRODUCTS_KEYS } from './use-query';

type CreateProductMutationInput = Omit<CreateProduct, 'organizationId'>;
type UpdateProductMutationInput = Omit<UpdateProduct, 'organizationId'>;

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();
  const organizationId = currentOrganization?.id;

  return useMutation<IProduct, Error, CreateProductMutationInput>({
    mutationKey: ['products', 'create'],

    mutationFn: (product) => ProductService.add(product, organizationId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PRODUCTS_KEYS.all
      });
    },

    meta: {
      successMessage: 'Produto criado com sucesso!'
    }
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();
  const organizationId = currentOrganization?.id;

  return useMutation<IProduct, Error, UpdateProductMutationInput>({
    mutationKey: ['products', 'update'],

    mutationFn: (product) => ProductService.update(product, organizationId),

    onSuccess: (product) => {
      queryClient.invalidateQueries({
        queryKey: PRODUCTS_KEYS.all
      });

      queryClient.invalidateQueries({
        queryKey: PRODUCTS_KEYS.detail(product.id)
      });
    },

    meta: {
      successMessage: 'Produto atualizado com sucesso!'
    }
  });
}
