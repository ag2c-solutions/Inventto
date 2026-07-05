import { CircleX } from 'lucide-react';

import { SubmittingButton } from '@/shared/components/common/submitting-button';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { ActionButton } from '@/features/permissions';

import { useDeleteOrganizationDialog } from './hooks/use-delete-organization-dialog';

export const DeleteOrganizationDialog = () => {
  const {
    typedName,
    setTypedName,
    purge,
    setPurge,
    organizationName,
    isExactMatch,
    isPending,
    handleConfirm,
    handleOpenChange
  } = useDeleteOrganizationDialog();

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <ActionButton action="org:manage" variant="destructive">
          Excluir
        </ActionButton>
      </DialogTrigger>
      <DialogContent className="max-w-md border-border border-1 font-medium">
        <DialogHeader className="items-center text-center">
          <span className="mb-2 flex size-14 items-center justify-center rounded-full bg-destructive/10">
            <CircleX className="size-6 text-destructive" />
          </span>
          <DialogTitle className="text-center font-bold text-xl">
            Excluir {organizationName}?
          </DialogTitle>
          <DialogDescription className="text-center font-normal">
            Esta ação encerra permanentemente esta unidade. Os catálogos saem do
            ar e a organização some do seu painel.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start space-x-3 py-2">
          <Checkbox
            id="purge-data"
            checked={purge}
            onCheckedChange={(checked) => setPurge(checked === true)}
            disabled={isPending}
            className="mt-1"
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="purge-data"
              className="text-sm text-foreground/50 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Também excluir permanentemente todos os dados desta organização.
            </label>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Inclui produtos, histórico e pedidos (direito ao esquecimento — LGPD).
          Sem essa opção, os dados ficam retidos e inacessíveis.
        </p>

        <div className="grid gap-2">
          <Label
            htmlFor="org-name-confirm"
            className="text-sm font-medium text-foreground"
          >
            Para confirmar, digite <strong>{organizationName}</strong> abaixo.
          </Label>
          <Input
            id="org-name-confirm"
            placeholder={organizationName}
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            disabled={isPending}
            className={
              !isExactMatch && typedName.length > 0
                ? 'border-destructive focus-visible:ring-destructive'
                : ''
            }
          />
          {!isExactMatch && typedName.length > 0 && (
            <p className="text-sm text-destructive font-medium">
              O nome não confere ainda.
            </p>
          )}
        </div>

        <DialogFooter className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:justify-stretch pt-2">
          <DialogTrigger asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </DialogTrigger>
          <SubmittingButton
            type="button"
            variant="destructive"
            state={isPending}
            label="Excluir organização"
            loadingLabel="Excluindo…"
            disabled={!isExactMatch || isPending}
            onClick={handleConfirm}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
