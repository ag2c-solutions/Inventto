import { Link } from 'react-router';
import {
  ArrowLeftRight,
  EllipsisVertical,
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
  DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/utils';

type ProductTableColumnActionsProps = {
  productId: string;
  /** Classe do contêiner (sobrescreve o alinhamento padrão da célula). */
  className?: string;
  /** Classe do botão acionador (ex.: overlay sobre a imagem no card mobile). */
  triggerClassName?: string;
};

export function ProductTableColumnActions({
  productId,
  className,
  triggerClassName
}: ProductTableColumnActionsProps) {
  return (
    <div className={cn('w-full flex justify-center pr-4', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Abrir menu de ações do produto"
            className={cn('text-sidebar-foreground', triggerClassName)}
          >
            <EllipsisVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="center">
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

          <DropdownMenuItem asChild>
            <ActionButton
              asChild
              action="movement:view"
              variant="ghost"
              className="w-full justify-start gap-2 font-normal"
            >
              <Link to={`/movements?productId=${productId}`}>
                <GalleryVerticalEnd className="h-4 w-4" />
                Histórico de movimentação
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
