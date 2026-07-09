import { useState } from 'react';

import {
  type Catalog,
  CatalogHasLinkedChannelsError
} from '../../../../../domain/entities';
import { useRemoveCatalogMutation } from '../../../../hooks/use-mutations';

interface UseRemoveCatalogOptions {
  onSuccess?: () => void;
}

export function useRemoveCatalog(
  catalog: Catalog,
  { onSuccess }: UseRemoveCatalogOptions = {}
) {
  const [confirmation, setConfirmation] = useState('');
  const [serverBlocked, setServerBlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutateAsync: removeCatalog, isPending } = useRemoveCatalogMutation();

  // Variante B (RN061): pré-checagem pela contagem de canais; o guard
  // definitivo é o do servidor (RPC delete_catalog), que pode bloquear
  // mesmo quando a contagem local estava zerada (serverBlocked).
  const isBlocked = serverBlocked || catalog.channelsCount > 0;

  // Variante A: "Remover" só habilita no match exato do nome.
  const canConfirm = confirmation === catalog.name;

  function reset() {
    setConfirmation('');
    setServerBlocked(false);
    setErrorMessage(null);
  }

  async function handleRemove() {
    if (!canConfirm || isPending) return;

    setErrorMessage(null);

    try {
      await removeCatalog(catalog.id);
      // Fecha o dialog explicitamente: a linha da tabela pode ser
      // reaproveitada pelo React para outro catálogo após a remoção.
      reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof CatalogHasLinkedChannelsError) {
        setServerBlocked(true);
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro inesperado ao remover o catálogo.'
      );
    }
  }

  return {
    confirmation,
    setConfirmation,
    isBlocked,
    canConfirm,
    isPending,
    errorMessage,
    handleRemove,
    reset
  };
}
