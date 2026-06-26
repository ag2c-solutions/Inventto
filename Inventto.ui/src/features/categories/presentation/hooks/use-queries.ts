import { useQuery } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { CategoryApi } from '../../data/api';

export function useCategoriesQuery() {
  const { currentOrganization } = useUser();
  const organizationId = currentOrganization?.id ?? '';

  return useQuery({
    queryKey: ['categories', organizationId],
    queryFn: () => CategoryApi.getAll(organizationId),
    staleTime: 1000 * 60 * 5,
    enabled: !!organizationId
  });
}
