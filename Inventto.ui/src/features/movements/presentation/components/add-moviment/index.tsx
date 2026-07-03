import { NavLink } from 'react-router';
import { Plus } from 'lucide-react';

import { ActionButton } from '@/features/permissions';

export const AddNewMovements = () => {
  return (
    <ActionButton action="movement:create">
      <NavLink
        className="flex gap-2 justify-center items-center"
        to="/movements/new"
      >
        <Plus className="h-4 w-4" />
        Registrar
      </NavLink>
    </ActionButton>
  );
};
