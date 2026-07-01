import { forwardRef } from 'react';
import { Link } from 'react-router';
import { SquarePen } from 'lucide-react';

import { ActionButton } from '@/features/permissions';

export const EditProductAction = forwardRef<
  HTMLButtonElement,
  { productId: string }
>(({ productId, ...props }, ref) => (
  <ActionButton
    ref={ref}
    asChild
    action="product:edit"
    variant="ghost"
    className="w-full justify-start gap-2 font-normal"
    {...props}
  >
    <Link to={`/products/${productId}/edit`}>
      <SquarePen className="h-4 w-4" />
      Editar
    </Link>
  </ActionButton>
));
EditProductAction.displayName = 'EditProductAction';
