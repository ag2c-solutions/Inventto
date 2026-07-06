import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

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

import { useChangeProductStatusMutation } from '../../../hooks/use-mutations';

export const ChangeProductStatusAction = ({
  productId,
  productName,
  isActive
}: {
  productId: string;
  productName: string;
  isActive: boolean;
}) => {
  const [openModal, setOpenModal] = useState(false);

  const { mutateAsync: changeProductStatus, isPending: isChangingStatus } =
    useChangeProductStatusMutation();

  const handleInactivate = async () => {
    try {
      await changeProductStatus({ productId: productId, isActive: false });
      setOpenModal(false);
    } catch {
      // erro já é exibido via toast global (MutationCache); modal permanece aberto
    }
  };

  const handleActivate = async () => {
    try {
      await changeProductStatus({ productId: productId, isActive: true });
    } catch {
      // erro já é exibido via toast global (MutationCache)
    }
  };

  return isActive ? (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-muted-foreground"
          onClick={() => setOpenModal(true)}
        >
          <EyeOff className="size-2.5 md:size-4" />
          <span className="hidden md:block">Inativar produto</span>
        </Button>
      </DialogTrigger>
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
            disabled={isChangingStatus}
            onClick={() => setOpenModal(false)}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={handleInactivate}
            disabled={isChangingStatus}
            variant="destructive"
          >
            {isChangingStatus && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Inativar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <Button
      variant="outline"
      className="text-muted-foreground"
      onClick={handleActivate}
      disabled={isChangingStatus}
    >
      <Eye className="size-2.5 md:size-4" />
      <span className="hidden md:block">Reativar produto</span>
    </Button>
  );
};
