import { EyeOff, Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog';

interface InactivateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function InactivateProductModal({
  open,
  onOpenChange,
  productName,
  onConfirm,
  isPending
}: InactivateProductModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full border bg-sidebar border-border">
            <EyeOff className="size-6 text-sidebar-foreground" />
          </div>

          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Inativar {productName}?
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Ele sai das listagens e dos catálogos, mas o histórico é mantido.
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="flex sm:justify-between gap-3 mt-4 w-full">
          <Button
            variant="outline"
            className="flex-1"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isPending}
            variant="destructive"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Inativar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
