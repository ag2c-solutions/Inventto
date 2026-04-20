import { ProductListTable } from '../../components/product-table';
import { PageHeader } from '@/app/components/shared/page-header';

export const ProductsListPage = () => {
  return (
    <div className=" flex flex-col gap-4">
      <PageHeader title="Produtos" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-6">
        <div className="flex flex-col gap-2 pb-6">
          <h2 className="text-2xl font-semibold">Gerenciar produtos</h2>
          <p className="text-muted-foreground">
            Gerencie de forma centralizada os produtos da sua empresa.
          </p>
        </div>
      </div>

      <section className="px-6">
        <ProductListTable />
      </section>
    </div>
  );
};
