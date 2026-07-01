import { forwardRef } from 'react';
import { Link } from 'react-router';
import { GalleryVerticalEnd } from 'lucide-react';

import { ActionButton } from '@/features/permissions';

export const SeeProductMovementsAction = forwardRef<
  HTMLButtonElement,
  { productId: string }
>(({ productId, ...props }, ref) => (
  <ActionButton
    ref={ref}
    asChild
    action="movement:view"
    variant="ghost"
    className="w-full justify-start gap-2 font-normal"
    {...props}
  >
    <Link to={`/movements?productId=${productId}`}>
      <GalleryVerticalEnd className="h-4 w-4" />
      Histórico de movimentação
    </Link>
  </ActionButton>
));
SeeProductMovementsAction.displayName = 'SeeProductMovementsAction';
