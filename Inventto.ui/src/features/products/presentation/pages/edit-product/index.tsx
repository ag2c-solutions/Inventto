import { useState } from 'react';
import { NavLink, useParams } from 'react-router';
import { ArrowUpLeftIcon, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { InactivateProductModal } from '../../components/inactivate-product';
import { ProductForm } from '../../components/product-form';
import { ProductFormProvider } from '../../components/product-form/hook';
import { useChangeProductStatusMutation } from '../../hooks/use-mutations';
import { useProductByIDQuery } from '../../hooks/use-queries';

interface ProductParams {
  [key: string]: string | undefined;
  productId: string;
}

export function EditProductPage() {
  const params = useParams<ProductParams>();

  const [openModal, setOpenModal] = useState(false);

  const { mutateAsync: changeProductStatus, isPending: isChangingStatus } =
    useChangeProductStatusMutation();

  const { productId } = params;
  const { data: product } = useProductByIDQuery(productId || '');

  if (!product) {
    return;
  }

  const handleInactivate = async () => {
    if (!product) return;
    await changeProductStatus({ productId: product.id, isActive: false });
    setOpenModal(false);
  };

  const handleActivate = async () => {
    if (!product) return;
    await changeProductStatus({ productId: product.id, isActive: true });
  };

  return (
    <section>
      <div className="flex items-start justify-between py-4 px-1 md:px-6 md:pb-0">
        <div className="flex flex-col gap-2 pb-6">
          <div className="flex gap-1 items-center">
            <NavLink to={`/products`} className="flex items-center">
              <div className="flex items-center justify-center size-4 md:size-8 rounded-lg bg-accent/50 group-hover:bg-accent transition-all">
                <ArrowUpLeftIcon className="text-primary" />
              </div>
            </NavLink>
            <h2 className="text-lg md:text-2xl font-semibold">
              Editar produto
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground md:ml-10">
            <span className="font-semibold text-foreground">
              {product.name}
            </span>
            <span>•</span>
            <span className="font-mono">SKU: {product.sku}</span>
          </div>
        </div>

        {product.isActive ? (
          <Button
            variant="outline"
            className="text-muted-foreground"
            onClick={() => setOpenModal(true)}
          >
            <EyeOff className="size-2.5 md:size-4" />
            <span className="hidden md:block">Inativar produto</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            className="text-muted-foreground"
            onClick={handleActivate}
            disabled={isChangingStatus}
          >
            <Eye className="size-2.5 md:size-4" />
            <span className="hidden md:block">Reativar produto</span>
          </Button>
        )}
      </div>

      <section className="px-1 md:px-6">
        <ProductFormProvider product={product} mode="Edit">
          <ProductForm />
        </ProductFormProvider>
      </section>

      <InactivateProductModal
        open={openModal}
        onOpenChange={setOpenModal}
        productName={product.name}
        onConfirm={handleInactivate}
        isPending={isChangingStatus}
      />
    </section>
  );
}
