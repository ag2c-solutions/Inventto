import { NavLink, useParams } from 'react-router';
import { ArrowUpLeftIcon } from 'lucide-react';

import { ProductForm } from '../../components/product-form';
import { ProductFormProvider } from '../../components/product-form/hook';
import { useProductByIDQuery } from '../../presentation/hooks/use-queries';

interface ProductParams {
  [key: string]: string | undefined;
  productId: string;
}

export function EditProductPage() {
  const params = useParams<ProductParams>();
  const { productId } = params;
  const { data: product } = useProductByIDQuery(productId || '');

  if (!product) {
    return;
  }

  return (
    <section>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:pb-0 px-6">
        <div className="flex flex-col gap-2 pb-6">
          <div className="flex gap-1">
            <NavLink to={`/products`} className="flex items-center">
              <div className="flex items-center justify-center size-8 rounded-lg bg-accent/50 group-hover:bg-accent transition-all">
                <ArrowUpLeftIcon className="size-4 text-primary" />
              </div>
            </NavLink>
            <h2 className="text-2xl font-semibold">{product.name}</h2>
          </div>
          <p className="text-muted-foreground">Edite os dados do produto.</p>
        </div>
      </div>
      <section className="px-6">
        <ProductFormProvider product={product} mode="Edit">
          <ProductForm />
        </ProductFormProvider>
      </section>
    </section>
  );
}
