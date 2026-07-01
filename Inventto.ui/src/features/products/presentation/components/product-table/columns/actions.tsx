import { EllipsisVertical } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/utils';

import { EditProductAction } from '../../actions/edit';
import { RegisterProductMovementAction } from '../../actions/register-movement';
import { SeeProductDetailsAction } from '../../actions/see-details';
import { SeeProductMovementsAction } from '../../actions/see-movements';

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
            <SeeProductDetailsAction productId={productId} />
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <EditProductAction productId={productId} />
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <SeeProductMovementsAction productId={productId} />
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <RegisterProductMovementAction productId={productId} />
          </DropdownMenuItem>
          {/* TODO: product:delete — adicionar ação de inativar/excluir com ActionButton action="product:delete" */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
