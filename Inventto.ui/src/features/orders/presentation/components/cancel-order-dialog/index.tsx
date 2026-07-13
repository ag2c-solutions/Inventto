import { Loader2, TriangleAlert } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';

import type { Order } from '../../../domain/entities';
import { ORDER_CANCEL_REASONS } from '../../../domain/validators';

import { useCancelOrderDialog } from './hooks/use-cancel-order-dialog';

interface CancelOrderDialogProps {
  order?: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// PED-05: Dialog pequeno sobre o card (PED-02) ou a Sheet (PED-04) — motivo
// obrigatório (RN086, lista fixa do wireframe) para liberar o destrutivo.
export function CancelOrderDialog({
  order,
  open,
  onOpenChange
}: CancelOrderDialogProps) {
  const { reason, setReason, canConfirm, isPending, handleCancel, reset } =
    useCancelOrderDialog(order, { onSuccess: () => onOpenChange(false) });

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) reset();
  }

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full sm:max-w-md! p-6">
        <DialogHeader className="flex items-center gap-4 justify-center text-center">
          <div className="flex h-15 w-15 items-center justify-center rounded-full border border-destructive/70 bg-destructive/10">
            <TriangleAlert className="h-5 w-5 text-destructive" />
          </div>
          <DialogTitle>Cancelar pedido #{order.code}?</DialogTitle>
          <DialogDescription>
            A reserva de estoque será desfeita. Selecione o motivo do
            cancelamento para registrar nas métricas do negócio.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Label>Motivo do cancelamento</Label>
          <RadioGroup
            value={reason}
            onValueChange={setReason}
            disabled={isPending}
          >
            {ORDER_CANCEL_REASONS.map((option) => (
              <div
                key={option}
                className="flex items-center gap-3 rounded-lg border py-3 pl-2 font-semibold transition-colors has-[[data-state=checked]]:bg-sidebar/80"
              >
                <RadioGroupItem value={option} id={`cancel-reason-${option}`} />
                <Label
                  htmlFor={`cancel-reason-${option}`}
                  className="cursor-pointer font-normal"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter className="grid grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isPending}
            onClick={() => handleOpenChange(false)}
          >
            Voltar
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            disabled={!canConfirm || isPending}
            onClick={handleCancel}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Cancelando…
              </>
            ) : (
              'Confirmar cancelamento'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
