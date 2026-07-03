import { forwardRef } from 'react';
import { Link } from 'react-router';
import { ArrowLeftRight } from 'lucide-react';

import { ActionButton } from '@/features/permissions';

export const RegisterProductMovementAction = forwardRef<
  HTMLButtonElement,
  { productId: string }
>(({ productId, ...props }, ref) => (
  <ActionButton
    ref={ref}
    asChild
    action="movement:create"
    variant="ghost"
    className="w-full justify-start gap-2 font-normal"
    {...props}
  >
    <Link
      className="w-full flex justify-start gap-2 font-normal"
      to={`/movements/new?preselect=${productId}`}
    >
      <ArrowLeftRight className="h-4 w-4" />
      Registrar movimentação
    </Link>
  </ActionButton>
));
RegisterProductMovementAction.displayName = 'RegisterProductMovementAction';
