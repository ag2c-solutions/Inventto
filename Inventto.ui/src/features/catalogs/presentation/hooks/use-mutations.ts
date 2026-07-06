import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import type {
  CreateCatalogPayload,
  UpdateCatalogPayload
} from '../../domain/entities';
import { CatalogService } from '../../domain/services';
import { CATALOG_KEYS } from '../constants';

export function useCreateCatalogMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: Omit<CreateCatalogPayload, 'organizationId'>) => {
      if (!currentOrganization?.id) {
        throw new Error('Organização não encontrada.');
      }

      return CatalogService.create({
        ...payload,
        organizationId: currentOrganization.id
      });
    },
    onSuccess: (catalog) => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.all });
      navigate(`/catalogos/${catalog.id}/produtos`);
    }
  });
}

export function useUpdateCatalogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCatalogPayload) =>
      CatalogService.update(payload),
    meta: { successMessage: 'Alterações salvas.' },
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
