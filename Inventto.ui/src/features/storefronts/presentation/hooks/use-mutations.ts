import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useUser } from '@/features/users';

import {
  type SaveStorefrontInput,
  StorefrontService
} from '../../domain/services';
import { STOREFRONT_KEYS } from '../constants';

export function useUnpublishStorefrontMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => StorefrontService.unpublish(id),
    meta: { successMessage: 'Vitrine despublicada.' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STOREFRONT_KEYS.all });
    }
  });
}

export function usePublishStorefrontMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => StorefrontService.publish(id),
    // Pré-requisitos faltando não é um erro de mutation (resolve com
    // published=false) — o toast só dispara no sucesso real, sem duplicar
    // feedback com o PublishDialog que a UI abre nesse caso.
    onSuccess: (result) => {
      if (!result.published) return;

      toast.success('Vitrine no ar.', { duration: 4000 });
      queryClient.invalidateQueries({ queryKey: STOREFRONT_KEYS.all });
    }
  });
}

interface SaveStorefrontVariables {
  id?: string;
  values: Omit<SaveStorefrontInput, 'organizationId'>;
}

export function useSaveStorefrontMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ id, values }: SaveStorefrontVariables) => {
      if (!currentOrganization?.id) {
        throw new Error('Organização não encontrada.');
      }

      return StorefrontService.save(
        { ...values, organizationId: currentOrganization.id },
        id
      );
    },
    meta: { successMessage: 'Alterações salvas.' },
    onSuccess: (id, variables) => {
      queryClient.invalidateQueries({ queryKey: STOREFRONT_KEYS.all });
      if (!variables.id) navigate(`/storefronts/${id}`);
    }
  });
}

interface RemoveStorefrontVariables {
  id: string;
  confirmation: string;
  expectedName: string;
}

export function useRemoveStorefrontMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      confirmation,
      expectedName
    }: RemoveStorefrontVariables) =>
      StorefrontService.remove(id, confirmation, expectedName),
    meta: { successMessage: 'Vitrine removida.' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STOREFRONT_KEYS.all });
    }
  });
}
