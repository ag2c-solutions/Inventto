import { NavLink } from 'react-router';
import { ArrowUpLeftIcon } from 'lucide-react';

import { ProductForm } from '../../components/product-form';
import { ProductFormProvider } from '../../components/product-form/hook';

export function CreateProductPage() {
  return (
    <section>
      <div className="flex flex-col py-4 md:gap-6 md:pb-0 md:px-6">
        <div className="flex flex-col gap-2 pb-6">
          <div className="flex gap-1">
            <NavLink to={`/products`} className="flex items-center">
              <div className="flex items-center justify-center size-4 md:size-8 rounded-lg bg-accent/50 group-hover:bg-accent transition-all">
                <ArrowUpLeftIcon className="text-primary" />
              </div>
            </NavLink>
            <h2 className="text-lg md:text-2xl font-semibold">
              Adicionar produto
            </h2>
          </div>
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
