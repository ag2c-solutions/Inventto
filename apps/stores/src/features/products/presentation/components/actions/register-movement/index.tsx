import { type ComponentProps, forwardRef } from 'react';
import { ArrowLeftRight } from 'lucide-react';

import { useOpenMovementSheet } from '@/features/movements';
import { ActionButton } from '@/features/permissions';

export const RegisterProductMovementAction = forwardRef<
  HTMLButtonElement,
  { productId: string } & Omit<ComponentProps<typeof ActionButton>, 'action'>
>(({ productId, onClick, ...props }, ref) => {
  const openMovementSheet = useOpenMovementSheet();

  return (
    <ActionButton
      ref={ref}
      action="movement:create"
      variant="ghost"
      className="w-full justify-start gap-2 font-normal"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        openMovementSheet(productId);
      }}
    >
      <ArrowLeftRight className="h-4 w-4" />
      Registrar movimentação
    </ActionButton>
  );
});
RegisterProductMovementAction.displayName = 'RegisterProductMovementAction';
