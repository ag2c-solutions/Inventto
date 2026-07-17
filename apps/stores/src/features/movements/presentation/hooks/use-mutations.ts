import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import type {
  CancelConfirmedSaleInput,
  CreateMovementInput
} from '../../domain/entities';
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

// MOV-06: também invalida `['orders']` (chave crua, sem importar
// internals de features/orders) — o pedido estornado deixa de contar
// como confirmado no painel de Pedidos/Dashboard se estiverem montados.
export function useCancelConfirmedSaleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['movements', 'cancel-confirmed-sale'],
    mutationFn: (input: CancelConfirmedSaleInput) => {
      return MovementService.cancelConfirmedSale(input);
    },
    meta: {
      successMessage: 'Venda estornada.'
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOVEMENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
}
