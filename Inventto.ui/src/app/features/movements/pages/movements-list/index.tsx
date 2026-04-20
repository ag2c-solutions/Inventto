import { MovementsListTable } from '../../components/movements-table';
import { useSearchParams } from 'react-router';
import { useMovementsQuery } from '../../hooks/use-query';
import { PageHeader } from '@/app/components/shared/page-header';

export function MovementsListPage() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId') || undefined;
  const { data } = useMovementsQuery(
    productId ? { productId: productId } : undefined
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Movimentações" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-6">
        <div className="flex flex-col gap-2 pb-6">
          <h2 className="text-2xl font-semibold">
            Gerenciar movimentações
          </h2>
          <p className="text-muted-foreground">
            Gerencie de forma centralizada as movimentações de estoque.
          </p>
        </div>
      </div>
      <section className='px-6'>
        <MovementsListTable data={data || []} productId={productId} />
      </section>
    </div>
  );
}
