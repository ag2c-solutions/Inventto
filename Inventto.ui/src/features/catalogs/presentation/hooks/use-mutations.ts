import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  CreateCatalogPayload,
  UpdateCatalogPayload
} from '../../domain/services';
import { CatalogService } from '../../domain/services';

export function useCatalogCreateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createCatalog'],
    mutationFn: (payload: CreateCatalogPayload) => CatalogService.add(payload),
    meta: { successMessage: 'Catálogo criado com sucesso' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
    }
  });
}

export function useCatalogUpdateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['updateCatalog'],
    mutationFn: (payload: UpdateCatalogPayload) =>
      CatalogService.update(payload),
    meta: { successMessage: 'Catálogo atualizado com sucesso' },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });

      if (data.id) {
        queryClient.invalidateQueries({ queryKey: ['catalog', data.id] });
      }
    }
  });
}

export function useCatalogRemoveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['removeCatalog'],
    mutationFn: (id: string) => CatalogService.remove(id),
    meta: { successMessage: 'Catálogo removido com sucesso' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
    }
  });
}
