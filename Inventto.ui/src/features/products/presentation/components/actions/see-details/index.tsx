import { forwardRef } from 'react';
import { Link } from 'react-router';
import { Eye } from 'lucide-react';

import { ActionButton } from '@/features/permissions';

export const SeeProductDetailsAction = forwardRef<
  HTMLButtonElement,
  { productId: string }
>(({ productId, ...props }, ref) => (
  <ActionButton
    ref={ref}
    asChild
    action="product:detail"
    variant="ghost"
    className="w-full justify-start gap-2 font-normal"
    {...props}
  >
    <Link to={`/products/${productId}`}>
      <Eye className="h-4 w-4" />
      Detalhes
    </Link>
  </ActionButton>
));
SeeProductDetailsAction.displayName = 'SeeProductDetailsAction';
