import { ProductListTable } from '../../components/product-table';

export const ProductsListPage = () => {
  return (
    <div className=" flex flex-col px-1  py-2 ">
      <div className="hidden md:flex flex-col gap-4 md:px-6">
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
