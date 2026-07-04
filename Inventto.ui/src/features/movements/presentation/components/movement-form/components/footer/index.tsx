import { Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { SheetFooter } from '@/shared/components/ui/sheet';

import { ActionButton } from '@/features/permissions';

import { useMovementForm } from '../../hooks';

export function MovementFormFooter() {
  const { form, isSubmitting, actions } = useMovementForm();

  const type = form.watch('type');
  const items = form.watch('items');
  const hasItems = !!items && items.length > 0;
  const hasInvalidRow =
    type === 'withdrawal' &&
    items?.some((item) => item.quantity > item.currentStock);

  const submitDisabled = isSubmitting || !hasItems || hasInvalidRow;

  return (
    <SheetFooter className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 border-t p-4">
      <Button type="button" variant="outline" onClick={actions.cancel}>
        Cancelar
      </Button>

      <ActionButton
        action="movement:create"
        type="submit"
        disabled={submitDisabled}
        className="flex-1"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? 'Registrando…' : 'Registrar'}
      </ActionButton>
    </SheetFooter>
  );
}
