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

type ProductTableColumnActionsProps = {
  productId: string;
};

export function ProductTableColumnActions({
  productId
}: ProductTableColumnActionsProps) {
  return (
    <div className="w-full flex justify-center pr-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Abrir menu de ações do produto"
          >
            <Ellipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <ActionButton
              asChild
              action="product:detail"
              variant="ghost"
              className="w-full justify-start gap-2 font-normal"
            >
              <Link to={`/products/${productId}`}>
                <Eye className="h-4 w-4" />
                Detalhes
              </Link>
            </ActionButton>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <ActionButton
              asChild
              action="product:edit"
              variant="ghost"
              className="w-full justify-start gap-2 font-normal"
            >
              <Link to={`/products/${productId}/edit`}>
                <SquarePen className="h-4 w-4" />
                Editar
              </Link>
            </ActionButton>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <ActionButton
              asChild
              action="movement:view"
              variant="ghost"
              className="w-full justify-start gap-2 font-normal"
            >
              <Link to={`/movements?productId=${productId}`}>
                <GalleryVerticalEnd className="h-4 w-4" />
                Ver histórico
              </Link>
            </ActionButton>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <ActionButton
              asChild
              action="movement:create"
              variant="ghost"
              className="w-full justify-start gap-2 font-normal"
            >
              <Link to={`/movements/new?preselect=${productId}`}>
                <ArrowLeftRight className="h-4 w-4" />
                Registrar movimentação
              </Link>
            </ActionButton>
          </DropdownMenuItem>
          {/* TODO: product:delete — adicionar ação de inativar/excluir com ActionButton action="product:delete" */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
