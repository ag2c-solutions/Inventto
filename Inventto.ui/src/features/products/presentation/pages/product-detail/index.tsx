import { useEffect, useMemo, useState } from 'react';
import { NavLink, useParams } from 'react-router';
import { ArrowUpLeftIcon } from 'lucide-react';

import { Card, CardContent } from '@/shared/components/ui/card';

import { ProductBasicInfosCard } from '../../components/basic-infos-card';
import { ProductImageCarousel } from '../../components/image-carousel';
import { ProductInventoryCard } from '../../components/inventory-card';
import { ProductOptionsSelect } from '../../components/options-select';
import { useProductByIDQuery } from '../../hooks/use-query';
import { getVariantImages } from '../../utils/get-variant-images';

interface ProductParams {
  [key: string]: string | undefined;
  productId: string;
}

export function ProductDetailsPage() {
  const params = useParams<ProductParams>();
  const { productId } = params;
  const { data: product } = useProductByIDQuery(productId || '');
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (
      product &&
      product.variants &&
      product.variants.length > 0 &&
      Object.keys(selectedOptions).length === 0
    ) {
      const firstVariant = product.variants[0];
      const initialOptions = firstVariant.options.reduce(
        (acc, option) => {
          acc[option.name] = option.value;
          return acc;
        },
        {} as Record<string, string>
      );

      setSelectedOptions(initialOptions);
    }
  }, [product, selectedOptions]);

  const handleSelectOption = (attributeName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [attributeName]: value }));
  };

  const selectedVariant = useMemo(() => {
    return product?.variants?.find((variant) => {
      return variant.options.every(
        (opt) => selectedOptions[opt.name] === opt.value
      );
    });
  }, [selectedOptions, product]);

  if (!product) {
    return 'Produto não encontrado';
  }

  const {
    name,
    description,
    categories,
    sku,
    allImages,
    attributes,
    hasVariants,
    minimumStock,
    stock
  } = product;

  return (
    <div>
      <section className="px-6 pt-4">
        <NavLink to={`/products`} className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-lg bg-accent/50 group-hover:bg-accent transition-all">
            <ArrowUpLeftIcon className="size-4 text-primary" />
          </div>
          <span>Produtos</span>
        </NavLink>
        <div className="space-y-6">
          <Card className="border-0 shadow-none px-0">
            <CardContent className="grid px-0 grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex h-full w-full items-center justify-center rounded-md bg-muted text-muted-foreground">
                {
                  <ProductImageCarousel
                    images={
                      !hasVariants
                        ? allImages
                        : getVariantImages({
                            allImages,
                            variantImagesId: new Set(
                              selectedVariant?.images.map((img) => img.id)
                            ),
                            primaryImageVariantId: selectedVariant?.images.find(
                              (img) => img.isPrimary
                            )?.id
                          })
                    }
                  />
                }
              </div>

              <div className="flex flex-col justify-between">
                <section className="space-y-4 flex flex-col gap-4">
                  <ProductBasicInfosCard
                    name={name}
                    sku={selectedVariant?.sku || sku}
                    categories={categories}
                    description={description}
                  />
                  {hasVariants && attributes && (
                    <ProductOptionsSelect
                      attributes={attributes}
                      onSelectOption={handleSelectOption}
                      selectedOptions={selectedOptions}
                    />
                  )}
                </section>

                <section className="flex flex-col gap-3">
                  {hasVariants && selectedVariant && (
                    <ProductInventoryCard
                      minimumStock={selectedVariant.minimumStock}
                      stock={selectedVariant.stock}
                    />
                  )}
                  {!hasVariants && (
                    <ProductInventoryCard
                      minimumStock={minimumStock}
                      stock={stock}
                    />
                  )}
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
