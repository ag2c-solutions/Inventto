import { useSearchParams } from 'react-router';

import { MovementsListTable } from '../../components/movements-table';
import { useMovementsQuery } from '../../hooks/use-queries';

export function MovementsListPage() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId') || undefined;
  const { data, isLoading } = useMovementsQuery(
    productId ? { productId } : undefined
  );

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col gap-1.5 py-6 px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Movimentações</h1>
        <p className="text-sm text-muted-foreground">
          Histórico cronológico e auditável de entradas e saídas de estoque.
          Registros são imutáveis.
        </p>
      </div>
      <div className="px-6 pb-6 flex-1 flex flex-col">
        <MovementsListTable
          data={data || []}
          isLoading={isLoading}
          productId={productId}
        />
      </div>
    </div>
  );
}
