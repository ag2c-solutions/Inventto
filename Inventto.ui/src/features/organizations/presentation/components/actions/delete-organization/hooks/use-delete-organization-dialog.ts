import { useState } from 'react';

import { useDeleteOrganizationMutation } from '@/features/organizations/presentation/hooks/use-mutations';
import { useUser } from '@/features/users';

export const useDeleteOrganizationDialog = (
  onOpenChange?: (open: boolean) => void
) => {
  const [typedName, setTypedName] = useState('');
  const [purge, setPurge] = useState(false);
  const { currentOrganization } = useUser();
  const { mutate, isPending } = useDeleteOrganizationMutation();

  const organizationName = currentOrganization?.name ?? '';
  const isExactMatch = typedName === organizationName;

  const handleConfirm = () => {
    mutate(purge, {
      onSuccess: () => {
        onOpenChange?.(false);
        setTypedName('');
        setPurge(false);
      }
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTypedName('');
      setPurge(false);
    }
    onOpenChange?.(open);
  };

  return {
    typedName,
    setTypedName,
    purge,
    setPurge,
    organizationName,
    isExactMatch,
    isPending,
    handleConfirm,
    handleOpenChange
  };
};
