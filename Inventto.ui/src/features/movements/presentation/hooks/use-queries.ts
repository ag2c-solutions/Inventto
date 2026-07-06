import { useQuery } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { MovementApi } from '../../data/api';
import { MOVEMENT_KEYS } from '../constants';

export function useMovementsQuery(filters?: { productId?: string }) {
  const { currentOrganization } = useUser();

  return useQuery({
    queryKey: MOVEMENT_KEYS.list(currentOrganization?.id, filters),
    queryFn: () =>
      MovementApi.getAll({
        organizationId: currentOrganization?.id ?? '',
        productId: filters?.productId
      }),
    enabled: !!currentOrganization
  });
}
