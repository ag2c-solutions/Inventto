import { Loader2, Lock, type LucideIcon } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { SheetFooter } from '@/shared/components/ui/sheet';

export interface OrderSheetPrimaryAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

interface OrderSheetFooterProps {
  primaryAction?: OrderSheetPrimaryAction;
  onCancel?: () => void;
  isSaving: boolean;
  savingLabel?: string;
}

// Rodapé de ações dinâmicas por micro-estado (RF034): sem `primaryAction`,
// o pedido está encerrado (finalizado/cancelado/expirado) — só leitura.
export function OrderSheetFooter({
  primaryAction,
  onCancel,
  isSaving,
  savingLabel
}: OrderSheetFooterProps) {
  if (!primaryAction) {
    return (
      <SheetFooter className="border-t">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="size-4" />
          Pedido encerrado — somente leitura.
        </p>
      </SheetFooter>
    );
  }

  const Icon = primaryAction.icon;

  return (
    <SheetFooter className="flex-row border-t">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          disabled={isSaving}
          onClick={onCancel}
          className="flex-1 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          Cancelar
        </Button>
      )}

      <Button
        type="button"
        disabled={isSaving}
        onClick={primaryAction.onClick}
        className="flex-1 gap-1.5"
      >
        {isSaving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Icon className="size-4" />
        )}
        {isSaving ? savingLabel : primaryAction.label}
      </Button>
    </SheetFooter>
  );
}
