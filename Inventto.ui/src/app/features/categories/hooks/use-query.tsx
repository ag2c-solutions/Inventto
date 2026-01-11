import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CategoryService } from '../service';
import { useUser } from '../../users/hooks/use-user';
export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['Categories'],
    queryFn: CategoryService.getAll,
    staleTime: 5000
  });
}

export function useCreateCategoryMutation() {
  const { organization } = useUser();
  const organizationId = organization?.id;

  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['CreateCategory'],
    mutationFn: (name: string) => {
      if (!organizationId) throw new Error('Nenhuma organização selecionada.');

      return CategoryService.create(name, organizationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Categories'] });
    }
  });
}
