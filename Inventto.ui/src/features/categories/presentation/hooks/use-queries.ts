import { useQuery } from '@tanstack/react-query';

import { CategoryApi } from '../../data/api';

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: CategoryApi.getAll,
    staleTime: 1000 * 60 * 5
  });
}
