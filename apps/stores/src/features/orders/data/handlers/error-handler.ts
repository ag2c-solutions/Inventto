import { type PostgrestError } from '@supabase/supabase-js';

import { isPostgrestError } from '@/infra/supabase/guards/is-postgres-error';

import {
  OrderAlreadyClaimedError,
  OrderInvalidTransitionError
} from '../../domain/entities';

// Marcador lançado pelo RPC claim_order quando outro vendedor já assumiu o
// pedido (RN082 — concorrência no pool).
export const ORDER_ALREADY_CLAIMED_ERROR_MARKER = 'ORDER_ALREADY_CLAIMED';

// Marcador lançado pelos RPCs advance_order/finalize_order/cancel_order
// quando a transição pedida não cabe no micro-estado atual.
export const ORDER_INVALID_TRANSITION_ERROR_MARKER = 'ORDER_INVALID_TRANSITION';

export function handleOrderError(
  error: PostgrestError | Error | unknown,
  action: string
): never {
  console.error(`Erro em Order Service [${action}]:`, error);

  if (
    error instanceof OrderAlreadyClaimedError ||
    error instanceof OrderInvalidTransitionError
  ) {
    throw error;
  }

  if (isPostgrestError(error)) {
    if (error.code === '42501') {
      throw new Error('Você não tem permissão para realizar esta ação.');
    }

    if (error.message.toLowerCase().includes('network')) {
      throw new Error('Erro de conexão. Verifique sua internet.');
    }
  }

  if (error instanceof Error) {
    throw new Error(error.message);
  }

  throw new Error('Ocorreu um erro inesperado ao processar o pedido.');
}
