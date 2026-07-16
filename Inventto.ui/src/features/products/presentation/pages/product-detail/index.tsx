import { useParams } from 'react-router';

import { BackToProductsLink } from '../../components/actions/back-to-products';
import { ProductDetailsCard } from '../../components/product-details';

interface ProductParams {
  [key: string]: string | undefined;
  productId: string;
}

export function ProductDetailsPage() {
  const params = useParams<ProductParams>();
  const { productId } = params;

  return (
    <div>
      <section className="px-4 md:px-6 pt-2 pb-8">
        <BackToProductsLink />
        <ProductDetailsCard productId={productId || ''} />
      </section>
    </div>
  );
}
