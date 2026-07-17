import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';

import { SubmittingButton } from '@/shared/components/common/submitting-button';
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

import { useDeactivateOrganizationMutation } from '@/features/organizations/presentation/hooks/use-mutations';
import { ActionButton } from '@/features/permissions';
import { useUser } from '@/features/users';

const CONSEQUENCES = [
  'Os catálogos e vitrines saem do ar.',
  'Gerentes e Vendedores perdem o acesso.',
  'Pedidos pendentes são cancelados e o estoque, liberado.'
];

export const DeactivateOrganizationDialog = () => {
  const [open, setOpen] = useState(false);
  const { currentOrganization } = useUser();
  const { mutate, isPending } = useDeactivateOrganizationMutation();

  const organizationName = currentOrganization?.name ?? 'esta organização';

  const handleConfirm = () => {
    mutate(undefined, {
      onSuccess: () => setOpen(false)
    });
  };

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
      <DialogContent className="max-w-md border-border border-1 font-medium">
        <DialogHeader className="items-center text-center">
          <span className="mb-2 flex size-14 items-center justify-center rounded-full bg-destructive/10">
            <TriangleAlert className="size-6 text-destructive" />
          </span>
          <DialogTitle className="text-center text-xl">
            Desativar {organizationName}?
          </DialogTitle>
          <DialogDescription className="text-center">
            A operação fica pausada — mas nada é perdido.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-3 rounded-lg bg-sidebar/70 p-4 text-sm text-muted-foreground">
          {CONSEQUENCES.map((item) => (
            <li key={item} className="flex items-center gap-3">
              <div className="flex size-3.5 items-center justify-center rounded-full bg-destructive/10">
                <span className="size-1 shrink-0 rounded-full bg-destructive/70" />
              </div>
              {item}
            </li>
          ))}
        </ul>

        <p className="text-center text-sm text-muted-foreground">
          Você pode reativar quando quiser.
        </p>

        <DialogFooter className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:justify-stretch">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <SubmittingButton
            type="button"
            variant="destructive"
            state={isPending}
            label="Desativar"
            loadingLabel="Desativando…"
            onClick={handleConfirm}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
