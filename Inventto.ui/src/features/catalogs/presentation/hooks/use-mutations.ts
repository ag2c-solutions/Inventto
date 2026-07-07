import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useUser } from '@/features/users';

import type {
  CatalogItem,
  CreateCatalogPayload,
  UpdateCatalogItemPricePayload,
  UpdateCatalogPayload
} from '../../domain/entities';
import { CatalogItemService, CatalogService } from '../../domain/services';
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

export function useAddCatalogItemsMutation(catalogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productIds: string[]) =>
      CatalogItemService.addItems({ catalogId, productIds }),
    meta: {
      successMessage: (data: unknown) =>
        `${(data as CatalogItem[]).length} produto(s) adicionado(s) ao catálogo.`
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CATALOG_KEYS.items(catalogId)
      });
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.all });
    }
  });
}

export function useUpdateCatalogItemPriceMutation(catalogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCatalogItemPricePayload) =>
      CatalogItemService.updateItemPrice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CATALOG_KEYS.items(catalogId)
      });
    }
  });
}

export function useRemoveCatalogItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: CatalogItem) => CatalogItemService.removeItem(item.id),
    onSuccess: (_data, item) => {
      queryClient.invalidateQueries({
        queryKey: CATALOG_KEYS.items(item.catalogId)
      });
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.all });

      toast(`${item.product.name} removido.`, {
        duration: 5000,
        action: {
          label: 'Desfazer',
          onClick: async () => {
            await CatalogItemService.restoreItem(item);
            queryClient.invalidateQueries({
              queryKey: CATALOG_KEYS.items(item.catalogId)
            });
            queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.all });
          }
        }
      });
    }
  });
}
