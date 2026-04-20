import { MovementForm } from '../../components/movement-form';
import { PageHeader } from '@/app/components/shared/page-header';

export function NewStockMovementPage() {
  return (
    <>
      <PageHeader title="Nova Movimentação" />
      <section className='px-6'>
        <MovementForm />
      </section>
    </>
  );
}
