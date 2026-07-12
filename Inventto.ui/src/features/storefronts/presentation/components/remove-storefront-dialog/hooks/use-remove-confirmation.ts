import { useState } from 'react';

import type { Storefront } from '../../../../domain/entities';
import { removeConfirmationValidator } from '../../../../domain/validators';
import { useRemoveStorefrontMutation } from '../../../hooks/use-mutations';

interface UseRemoveConfirmationOptions {
  onSuccess?: () => void;
}

export function useRemoveConfirmation(
  storefront: Storefront,
  { onSuccess }: UseRemoveConfirmationOptions = {}
) {
  const [confirmation, setConfirmation] = useState('');
  const { mutateAsync: removeStorefront, isPending } =
    useRemoveStorefrontMutation();

  const canConfirm = removeConfirmationValidator(confirmation, storefront.name);

  function reset() {
    setConfirmation('');
  }

  async function handleRemove() {
    if (!canConfirm || isPending) return;

    await removeStorefront({
      id: storefront.id,
      confirmation,
      expectedName: storefront.name
    });

    reset();
    onSuccess?.();
  }

  return {
    confirmation,
    setConfirmation,
    canConfirm,
    isPending,
    handleRemove,
    reset
  };
}
