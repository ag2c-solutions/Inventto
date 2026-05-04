import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { CategoryService } from '../../domain/services';

export function useCategoryAddMutation() {
  const { organization } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['categories', 'add'],
    mutationFn: (name: string) => {
      if (!organization?.id) {
        throw new Error('Nenhuma organização selecionada.');
      }

      return CategoryService.add({ name, organizationId: organization.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
}
