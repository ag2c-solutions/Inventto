import { Plus } from 'lucide-react';

import { ActionButton } from '@/features/permissions';

import { useOpenMovementSheet } from '../../hooks/use-open-movement-sheet';

export const AddNewMovements = () => {
  const openMovementSheet = useOpenMovementSheet();

  return (
    <ActionButton
      action="movement:create"
      onClick={() => openMovementSheet()}
      className="flex gap-2 justify-center items-center"
    >
      <Plus className="h-4 w-4" />
      Registrar
    </ActionButton>
  );
};
