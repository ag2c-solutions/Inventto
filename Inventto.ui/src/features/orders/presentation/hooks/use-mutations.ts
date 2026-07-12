import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { OrderMicroState } from '../../domain/entities';
import { OrderService } from '../../domain/services';
import { ORDER_KEYS } from '../constants';

export function useClaimOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => OrderService.claim(id),
    meta: { successMessage: 'Pedido assumido.' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
    }
  });
}

interface AdvanceOrderVariables {
  id: string;
  microState: OrderMicroState;
}

export function useAdvanceOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, microState }: AdvanceOrderVariables) =>
      OrderService.advance(id, microState),
    meta: { successMessage: 'Pedido atualizado.' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
    }
  });
}

interface FinalizeOrderVariables {
  id: string;
  microState: OrderMicroState;
}

export function useFinalizeOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, microState }: FinalizeOrderVariables) =>
      OrderService.finalize(id, microState),
    meta: { successMessage: 'Pedido finalizado e estoque baixado.' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
    }
  });
}

interface CancelOrderVariables {
  id: string;
  microState: OrderMicroState;
  reason: string;
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, microState, reason }: CancelOrderVariables) =>
      OrderService.cancel(id, microState, reason),
    meta: { successMessage: 'Pedido cancelado.' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
    }
  });
}
