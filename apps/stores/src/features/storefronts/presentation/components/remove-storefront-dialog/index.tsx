import { Loader2, Trash2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import type { Storefront } from '../../../domain/entities';

import { useRemoveConfirmation } from './hooks/use-remove-confirmation';

interface RemoveStorefrontDialogProps {
  storefront: Storefront;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RemoveStorefrontDialog({
  storefront,
  open,
  onOpenChange
}: RemoveStorefrontDialogProps) {
  const {
    confirmation,
    setConfirmation,
    canConfirm,
    isPending,
    handleRemove,
    reset
  } = useRemoveConfirmation(storefront, {
    onSuccess: () => onOpenChange(false)
  });

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) reset();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full sm:max-w-md! p-6">
        <DialogHeader className="flex items-center gap-4 justify-center text-center">
          <div className="flex h-15 w-15 items-center justify-center rounded-full border border-destructive/70 bg-destructive/10">
            <Trash2 className="h-5 w-5 text-destructive" />
          </div>
          <DialogTitle>Remover {storefront.name}?</DialogTitle>
          <DialogDescription>
            A vitrine sai do ar e o link{' '}
            {storefront.publicUrl ?? `inventto.app/${storefront.slug}`} deixa de
            funcionar. O catálogo e os produtos não são afetados.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="remove-storefront-confirmation">
            Digite o nome da vitrine para confirmar
          </Label>
          <Input
            id="remove-storefront-confirmation"
            placeholder={storefront.name}
            value={confirmation}
            disabled={isPending}
            onChange={(e) => setConfirmation(e.target.value)}
          />
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
              'Remover vitrine'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
