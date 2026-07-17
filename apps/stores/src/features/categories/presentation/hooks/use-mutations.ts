import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { CategoryService } from '../../domain/services';

export function useCategoryAddMutation() {
  const { currentOrganization } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['categories', 'add'],
    mutationFn: (name: string) =>
      CategoryService.add({
        name,
        organizationId: currentOrganization?.id ?? ''
      }),
    meta: {
      successMessage: 'Categoria adicionada com sucesso.'
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
}
