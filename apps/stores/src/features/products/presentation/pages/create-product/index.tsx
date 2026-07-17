import { BackToProductsLink } from '../../components/actions/back-to-products';
import { ProductForm } from '../../components/forms/product-form';
import { ProductFormProvider } from '../../components/forms/product-form/hook';

export function CreateProductPage() {
  return (
    <section>
      <div className="flex flex-col py-2 md:pb-0 md:px-6">
        <div className="flex flex-col gap-2 pb-6">
          <BackToProductsLink />
          <h2 className="text-lg md:text-2xl font-semibold">
            Adicionar produto
          </h2>
          <p className="text-muted-foreground">
            Adicione um novo produto ao seu catálogo.
          </p>
        </div>
      </div>
      <div className="px-1 md:px-6">
        <ProductFormProvider mode="Create">
          <ProductForm />
        </ProductFormProvider>
      </div>
    </section>
  );
}
