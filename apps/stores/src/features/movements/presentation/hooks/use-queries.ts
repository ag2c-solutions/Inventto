import { useQuery } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { MovementService } from '../../domain/services';
import { MOVEMENT_KEYS } from '../constants';

export function useMovementsQuery(filters?: { productId?: string }) {
  const { currentOrganization, role } = useUser();

  return useQuery({
    queryKey: MOVEMENT_KEYS.list(currentOrganization?.id, filters),
    // MOV-08: fork por papel no service — Sales lê pela RPC sanitizada.
    queryFn: () =>
      MovementService.getAll({
        organization: currentOrganization,
        role,
        productId: filters?.productId
      }),
    enabled: !!currentOrganization && !!role
  });
}
