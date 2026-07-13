import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, RotateCcw, TriangleAlert } from 'lucide-react';

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
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import { ActionButton } from '@/features/permissions';

import type { Movement } from '../../../domain/entities';
import { SALE_CANCEL_REASONS } from '../../../domain/validators';

import { useCancelSaleAction } from './hooks/use-cancel-sale-action';

interface CancelSaleActionProps {
  movement: Movement;
}

// MOV-06: gatilho fica na linha (aqui, no cabeçalho do detalhe expandido) —
// só aparece pra vendas do PDV com o pedido ainda `confirmed` (RN051: não
// edita a movimentação original, cria uma entrada nova vinculada ao mesmo
// order_id). Recorte de papel (Manager/Owner) via ActionButton.
export function CancelSaleAction({ movement }: CancelSaleActionProps) {
  const [open, setOpen] = useState(false);
  const { reason, setReason, canConfirm, isPending, handleCancel, reset } =
    useCancelSaleAction(movement, { onSuccess: () => setOpen(false) });

  if (
    movement.reason !== 'Venda' ||
    !movement.orderId ||
    movement.orderStatus !== 'confirmed'
  ) {
    return null;
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  const totalSaleValue = movement.items.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <ActionButton
          action="movement:cancel_sale"
          variant="outline"
          size="sm"
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Estornar venda
        </ActionButton>
      </DialogTrigger>

      <DialogContent className="w-full sm:max-w-md! p-6">
        <DialogHeader className="flex items-center gap-4 justify-center text-center">
          <div className="flex h-15 w-15 items-center justify-center rounded-full border border-destructive/70 bg-destructive/10">
            <TriangleAlert className="h-5 w-5 text-destructive" />
          </div>
          <DialogTitle>Estornar esta venda?</DialogTitle>
          <DialogDescription>
            O estoque vendido será restaurado e o pedido será cancelado. Esta
            ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Data da venda</span>
            <span className="font-medium">
              {format(movement.executedAt, "dd/MM/yyyy '·' HH:mm", {
                locale: ptBR
              })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Itens</span>
            <span className="font-medium">{movement.items.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Valor</span>
            <span className="font-medium">
              {formatCurrency(totalSaleValue)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Label>Motivo do estorno</Label>
          <RadioGroup
            value={reason}
            onValueChange={setReason}
            disabled={isPending}
          >
            {SALE_CANCEL_REASONS.map((option) => (
              <div
                key={option}
                className="flex items-center gap-3 rounded-lg border py-3 pl-2 font-semibold transition-colors has-[[data-state=checked]]:bg-sidebar/80"
              >
                <RadioGroupItem
                  value={option}
                  id={`cancel-sale-reason-${option}`}
                />
                <Label
                  htmlFor={`cancel-sale-reason-${option}`}
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
                Estornando…
              </>
            ) : (
              'Confirmar estorno'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
