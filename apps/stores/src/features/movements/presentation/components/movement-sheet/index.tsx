import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/shared/components/ui/sheet';

import { useMovementSheetStore } from '../../stores/movement-sheet-store';
import { MovementForm } from '../movement-form';

export function MovementSheet() {
  const isOpen = useMovementSheetStore((state) => state.isOpen);
  const preselectProductId = useMovementSheetStore(
    (state) => state.preselectProductId
  );
  const close = useMovementSheetStore((state) => state.close);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent className="flex flex-col gap-0 p-0 w-full sm:max-w-[480px] overflow-hidden">
        <SheetHeader className="border-b">
          <SheetTitle>Registrar movimentação</SheetTitle>
          <SheetDescription>
            Registre uma entrada ou saída de estoque.
          </SheetDescription>
        </SheetHeader>

        {isOpen && (
          <MovementForm
            key={preselectProductId}
            preselectProductId={preselectProductId}
            onSuccess={close}
            onCancel={close}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
