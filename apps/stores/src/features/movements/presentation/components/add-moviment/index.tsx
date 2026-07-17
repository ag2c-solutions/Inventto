import { Plus } from 'lucide-react';

import { cn } from '@/shared/utils';

import { ActionButton } from '@/features/permissions';

import { useOpenMovementSheet } from '../../hooks/use-open-movement-sheet';

interface AddNewMovementsProps {
  iconOnly?: boolean;
}

export const AddNewMovements = ({
  iconOnly = false
}: AddNewMovementsProps = {}) => {
  const openMovementSheet = useOpenMovementSheet();

  return (
    <ActionButton
      action="movement:create"
      onClick={() => openMovementSheet()}
      aria-label="Registrar movimentação"
      className={cn(
        'flex gap-2 justify-center items-center',
        iconOnly && 'size-9 p-0'
      )}
    >
      <Plus className="h-4 w-4" />
      {!iconOnly && 'Registrar'}
    </ActionButton>
  );
};
