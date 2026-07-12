import { useQuery } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { StorefrontApi } from '../../data/api';
import { STOREFRONT_KEYS } from '../constants';

export function useStorefrontsQuery() {
  const { currentOrganization } = useUser();

  return useQuery({
    queryKey: [...STOREFRONT_KEYS.all, currentOrganization?.id],
    queryFn: () => StorefrontApi.getStorefronts(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
    staleTime: 1000 * 60 * 5
  });
}
