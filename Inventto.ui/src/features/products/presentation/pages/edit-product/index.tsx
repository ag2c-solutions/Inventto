import { useParams } from 'react-router';

import { BackToProductsLink } from '../../components/actions/back-to-products';
import { ChangeProductStatusAction } from '../../components/actions/change-product-status';
import { ProductForm } from '../../components/forms/product-form';
import { ProductFormProvider } from '../../components/forms/product-form/hook';
import { useProductByIDQuery } from '../../hooks/use-queries';

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
      <div className="flex items-start justify-between py-2 px-1 md:px-6 md:pb-0">
        <div className="flex flex-col gap-2 pb-6">
          <BackToProductsLink />
          <h2 className="text-lg md:text-2xl font-semibold">Editar produto</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {product.name}
            </span>
            <span>•</span>
            <span className="font-mono">SKU: {product.sku}</span>
          </div>
        </div>

        <ChangeProductStatusAction
          productId={product.id}
          productName={product.name}
          isActive={product.isActive}
        />
      </div>

      <section className="px-1 md:px-6">
        <ProductFormProvider product={product} mode="Edit">
          <ProductForm />
        </ProductFormProvider>
      </section>
    </section>
  );
}
