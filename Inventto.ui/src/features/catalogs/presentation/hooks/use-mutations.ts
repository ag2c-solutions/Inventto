import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import type {
  CreateCatalogPayload,
  UpdateCatalogPayload
} from '../../domain/entities';
import { CatalogService } from '../../domain/services';
import { CATALOG_KEYS } from '../constants';

export function useCatalogCreateMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();

  return useMutation({
    mutationFn: (payload: Omit<CreateCatalogPayload, 'organizationId'>) => {
      if (!currentOrganization?.id) {
        throw new Error('Organização não encontrada.');
      }

      return CatalogService.add({
        ...payload,
        organizationId: currentOrganization.id
      });
    },
    meta: { successMessage: 'Catálogo criado com sucesso' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.all });
    }
  });
}

export function useCatalogUpdateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCatalogPayload) =>
      CatalogService.update(payload),
    meta: { successMessage: 'Catálogo atualizado com sucesso' },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.detail(data.id) });
    }
  });
}

export function useCatalogRemoveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CatalogService.remove(id),
    meta: { successMessage: 'Catálogo removido com sucesso' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.all });
    }
  });
}
