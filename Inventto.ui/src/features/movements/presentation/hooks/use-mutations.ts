import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import type { CreateMovementInput } from '../../domain/entities';
import { MovementService } from '../../domain/services';
import { MOVEMENT_KEYS } from '../constants';

export function useMovementCreateMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization: organization } = useUser();

  return useMutation({
    mutationKey: ['movements', 'create'],
    mutationFn: (input: CreateMovementInput) => {
      return MovementService.create({
        input,
        organization: organization
      });
    },
    meta: {
      successMessage: 'Movimentação registrada.'
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOVEMENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}
