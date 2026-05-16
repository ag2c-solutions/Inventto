import { useQuery } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { MovementService } from '../../domain/services';
import { MOVEMENT_KEYS } from '../constants';

export function useMovementsQuery(filters?: { productId?: string }) {
  const { currentOrganization } = useUser();

  return useQuery({
    queryKey: MOVEMENT_KEYS.list(currentOrganization?.id, filters),
    queryFn: () =>
      MovementService.getAll({
        organization: currentOrganization,
        productId: filters?.productId
      }),
    enabled: !!currentOrganization
  });
}
