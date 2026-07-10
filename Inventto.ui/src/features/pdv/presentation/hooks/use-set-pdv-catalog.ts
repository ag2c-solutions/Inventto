import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { PdvService } from '../../domain/services';
import { PDV_KEYS } from '../constants';

export function useSetPdvCatalogMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();
  const organizationId = currentOrganization?.id ?? '';

  return useMutation({
    mutationFn: (catalogId: string) => PdvService.setPdvCatalog(catalogId),
    meta: { successMessage: 'Catálogo vinculado ao PDV.' },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PDV_KEYS.catalog(organizationId)
      });
    }
  });
}
