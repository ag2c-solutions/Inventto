import { useState } from 'react';

import { useUser } from '@/features/users';

/**
 * Hook exclusivo do componente OrganizationSwitcher.
 * Gerencia: estado do popover e handler de seleção de org.
 * A lógica de "ignorar org ativa" e toast de falha vivem em useUser.
 */
export function useOrganizationSwitcher() {
  const {
    currentOrganization,
    availableOrganizations,
    role,
    isSwitching,
    setCurrentOrganization
  } = useUser();

  const [open, setOpen] = useState(false);

  // RN011: Trigger estático quando org única e papel não é Owner.
  const isStaticTrigger =
    availableOrganizations.length === 1 && role !== 'owner';

  function handleSelect(orgId: string) {
    setCurrentOrganization(orgId);
    setOpen(false);
  }

  return {
    open,
    setOpen,
    currentOrganization,
    availableOrganizations,
    role,
    isSwitching,
    isStaticTrigger,
    handleSelect
  };
}
