import { useState } from 'react';

import type { Order } from '../../../../domain/entities';
import { cancelReasonValidator } from '../../../../domain/validators';
import { useCancelOrderMutation } from '../../../hooks/use-mutations';

interface UseCancelOrderDialogOptions {
  onSuccess?: () => void;
}

export function useCancelOrderDialog(
  order: Order | undefined,
  { onSuccess }: UseCancelOrderDialogOptions = {}
) {
  const [reason, setReason] = useState('');
  const { mutateAsync: cancelOrder, isPending } = useCancelOrderMutation();

  const canConfirm = cancelReasonValidator(reason);

  function reset() {
    setReason('');
  }

  async function handleCancel() {
    if (!order || !canConfirm || isPending) return;

    await cancelOrder({ id: order.id, microState: order.microState, reason });

    reset();
    onSuccess?.();
  }

  return { reason, setReason, canConfirm, isPending, handleCancel, reset };
}
