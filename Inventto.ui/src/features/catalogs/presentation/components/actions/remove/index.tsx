import { useState } from 'react';
import { Loader2, Trash2, TriangleAlert } from 'lucide-react';

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
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { ActionButton } from '@/features/permissions';

import type { Catalog } from '../../../../domain/entities';

import { useRemoveCatalog } from './hooks/use-remove-catalog';

interface RemoveCatalogDialogProps {
  catalog: Catalog;
}

export function RemoveCatalogDialog({ catalog }: RemoveCatalogDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    confirmation,
    setConfirmation,
    isBlocked,
    canConfirm,
    isPending,
    errorMessage,
    handleRemove,
    reset
  } = useRemoveCatalog(catalog, { onSuccess: () => setOpen(false) });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <ActionButton
          action="catalog:manage"
          variant="ghost"
          size="icon-sm"
          title="Remover catálogo"
          className="hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remover catálogo</span>
        </ActionButton>
      </DialogTrigger>

      <DialogContent className="w-full sm:max-w-md! p-6">
        {isBlocked ? (
          <>
            <DialogHeader className="text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
                <TriangleAlert className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              </div>
              <DialogTitle>Não é possível remover {catalog.name}</DialogTitle>
              <DialogDescription>
                Este catálogo está sendo usado por {catalog.channelsCount}{' '}
                {catalog.channelsCount === 1 ? 'canal' : 'canais'}.
                Desvincule-os antes de remover.
              </DialogDescription>
            </DialogHeader>

            {/* A lista de canais vinculados (ícone + nome + link para a config
                do canal) entra aqui quando Vitrines/PDV expuserem a fonte de
                vínculo — mesmo ponto de coordenação do RPC delete_catalog. */}

            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Entendi
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="flex items-center gap-4 justify-center text-center">
              <div className="flex h-15 w-15 items-center justify-center border border-destructive/70 rounded-full bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Remover {catalog.name}?</DialogTitle>
              <DialogDescription>
                Esta ação não pode ser desfeita. Pedidos que referenciam este
                catálogo preservam o histórico.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Label htmlFor="remove-catalog-confirmation">
                Digite o nome do catálogo para confirmar
              </Label>
              <Input
                id="remove-catalog-confirmation"
                placeholder={catalog.name}
                value={confirmation}
                disabled={isPending}
                onChange={(e) => setConfirmation(e.target.value)}
              />
              {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
              )}
            </div>

            <DialogFooter className="grid grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isPending}
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                disabled={!canConfirm || isPending}
                onClick={handleRemove}
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Removendo…
                  </>
                ) : (
                  'Remover'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
