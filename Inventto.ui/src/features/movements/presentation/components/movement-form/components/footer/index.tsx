import { Loader2 } from 'lucide-react';

import { ActionButton } from '@/features/permissions';

import { useMovementForm } from '../../hooks';

export function MovementFormFooter() {
  const { form, isSubmitting } = useMovementForm();

  const totalItems = form.watch('totalQuantity');

  return (
    <div className="absolute bottom-4 left-0 rounded-xl right-0 border py-4 bg-background z-20">
      <div className="container mx-auto px-2 sm:px-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Resumo do Lote</span>
          <span className="text-sm md:text-lg font-bold">
            {totalItems || 0} Itens
          </span>
        </div>

        <ActionButton
          action="movement:create"
          size="lg"
          type="submit"
          disabled={!totalItems || totalItems === 0 || isSubmitting}
          className="hidden sm:flex"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Finalizar Movimentação
        </ActionButton>

        <ActionButton
          action="movement:create"
          size="sm"
          type="submit"
          disabled={!totalItems || totalItems === 0 || isSubmitting}
          className="sm:hidden"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Finalizar
        </ActionButton>
      </div>
    </div>
  );
}
