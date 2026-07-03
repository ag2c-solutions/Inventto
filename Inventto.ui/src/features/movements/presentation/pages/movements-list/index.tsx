import { NavLink, useSearchParams } from 'react-router';
import { ArrowRightLeft } from 'lucide-react';

import { ActionButton } from '@/features/permissions';

import { MovementsListTable } from '../../components/movements-table';
import { useMovementsQuery } from '../../hooks/use-queries';

export function MovementsListPage() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId') || undefined;
  const { data } = useMovementsQuery(
    productId ? { productId: productId } : undefined
  );

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-6 px-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            Movimentações
          </h1>
          <p className="text-sm text-muted-foreground">
            Histórico cronológico e auditável de entradas e saídas de estoque.
            Registros são imutáveis.
          </p>
        </div>
        <ActionButton action="movement:create" size="sm">
          <NavLink className="flex gap-2 justify-center items-center" to="new">
            <ArrowRightLeft className="h-4 w-4" />
            Nova Movimentação
          </NavLink>
        </ActionButton>
      </div>
      <div className="px-6 pb-6 flex-1 flex flex-col">
        <MovementsListTable data={data || []} productId={productId} />
      </div>
    </div>
  );
}
