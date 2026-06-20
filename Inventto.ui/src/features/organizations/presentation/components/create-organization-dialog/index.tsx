import { useState } from 'react';

import { ActionButton } from '@/features/permissions';
import { useUser } from '@/features/users';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog';

import { CreateOrgForm } from '../create-organization-form';

export const CreateOrganizationDialog = () => {
  const [open, setOpen] = useState(false);
  const { availableOrganizations } = useUser();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionButton
          action="org:create"
          variant="ghost"
          className="w-full justify-start font-normal"
        >
          Criar organização
        </ActionButton>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova organização</DialogTitle>
          <DialogDescription>
            Crie outra unidade sem sair do contexto atual.
          </DialogDescription>
        </DialogHeader>
        <CreateOrgForm
          otherOrganizations={availableOrganizations}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
