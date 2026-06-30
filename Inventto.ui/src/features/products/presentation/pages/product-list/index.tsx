import { ProductListTable } from '../../components/product-table';

export const ProductsListPage = () => {
  return (
    <div className=" flex flex-col gap-4">
      <div className="hidden md:flex flex-col gap-4 py-4 md:gap-6 md:py-6 md:px-6">
        <div className="flex flex-col gap-2 pb-6">
          <h1 className="text-2xl font-semibold">Produtos</h1>
          <p className="text-muted-foreground">
            Localize produtos, consulte o estado do estoque e gerencie o
            catálogo da organização.
          </p>
        </div>
      </div>

      <section className="px-1 md:px-6">
        <ProductListTable />
      </section>
    </div>
  );
};
