import { useState } from 'react';

import type { Movement } from '../../../../domain/entities';
import { saleCancelReasonValidator } from '../../../../domain/validators';
import { useCancelConfirmedSaleMutation } from '../../../hooks/use-mutations';

interface UseCancelSaleActionOptions {
  onSuccess?: () => void;
}

export function useCancelSaleAction(
  movement: Movement,
  { onSuccess }: UseCancelSaleActionOptions = {}
) {
  const [reason, setReason] = useState('');
  const { mutateAsync: cancelConfirmedSale, isPending } =
    useCancelConfirmedSaleMutation();

  const canConfirm = saleCancelReasonValidator(reason);

  function reset() {
    setReason('');
  }

  async function handleCancel() {
    if (!movement.orderId || !canConfirm || isPending) return;

    await cancelConfirmedSale({ orderId: movement.orderId, reason });

    reset();
    onSuccess?.();
  }

  return { reason, setReason, canConfirm, isPending, handleCancel, reset };
}
