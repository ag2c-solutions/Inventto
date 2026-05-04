import { useState } from 'react';
import { PlusCircle } from 'lucide-react';

import { ActionButton } from '@/features/permissions';

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionButton
          action="org:create"
          variant="ghost"
          className="w-full justify-start font-normal"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Criar Organização
        </ActionButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Organização</DialogTitle>
          <DialogDescription>
            Crie uma nova organização para gerenciar seus projetos.
          </DialogDescription>
        </DialogHeader>
        <CreateOrgForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
