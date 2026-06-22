import { useState } from 'react';

import { ActionButton } from '@/features/permissions';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog';

export const DeactivateOrganizationDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionButton
          action="org:manage"
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          Desativar
        </ActionButton>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Desativar organização</DialogTitle>
          <DialogDescription>
            Pausa as vendas e tira as vitrines do ar temporariamente. Você pode
            reativar quando quiser.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Desativar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
