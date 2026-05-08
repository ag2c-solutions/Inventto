import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import type { CreateMovementInput } from '../../domain/entities';
import { MovementService } from '../../domain/services';
export function useMovementCreateMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization: organization } = useUser();

  return useMutation({
    mutationKey: ['movements', 'create'],
    mutationFn: (input: CreateMovementInput) => {
      if (!organization?.id) {
        throw new Error('Nenhuma organização selecionada.');
      }

      return MovementService.create({
        input,
        organizationId: organization.id
      });
    },
    meta: {
      successMessage: 'Movimentação registrada com sucesso!'
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}
