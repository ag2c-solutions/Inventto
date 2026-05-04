import { Link } from 'react-router';
import {
  ArrowLeftRight,
  Ellipsis,
  Eye,
  GalleryVerticalEnd,
  SquarePen
} from 'lucide-react';

import { ActionButton } from '@/features/permissions';

import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu';

export function ProductTableColumnActions({
  productId
}: {
  productId: string;
}) {
  return (
    <div className="w-full flex justify-center pr-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={'outline'} size="icon-sm" aria-label="toggle menu">
            <Ellipsis className="from-accent-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <ActionButton
              action="product:detail"
              size={'icon-sm'}
              variant={'ghost'}
              className="w-full"
            >
              <Link
                className="flex gap-2 w-full items-center text-sm font-normal"
                to={`/products/${productId}`}
              >
                <Eye /> Detalhes
              </Link>
            </ActionButton>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <ActionButton
              action="product:edit"
              size={'icon-sm'}
              variant={'ghost'}
              className="w-full"
            >
              <Link
                className="flex gap-2 w-full items-center text-sm font-normal"
                to={`/products/${productId}/edit`}
              >
                <SquarePen /> Editar
              </Link>
            </ActionButton>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <ActionButton
              action="movement:view"
              size={'icon-sm'}
              variant={'ghost'}
              className="w-full"
            >
              <Link
                className="flex gap-2 w-full items-center text-sm font-normal"
                to={`/movements?productId=${productId}`}
              >
                <GalleryVerticalEnd /> Ver Histórico
              </Link>
            </ActionButton>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <ActionButton
              action="movement:create"
              size={'icon-sm'}
              variant={'ghost'}
              className="w-full"
            >
              <Link
                className="flex gap-2 w-full items-center text-sm font-normal"
                to={`/movements/new?preselect=${productId}`}
              >
                <ArrowLeftRight /> Registrar Movimentação
              </Link>
            </ActionButton>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
