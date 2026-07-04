import { useEffect, useMemo, useState } from 'react';
import { MoreVertical } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu';

import { VisibleTo } from '@/features/permissions';

import { useProductByIDQuery } from '../../hooks/use-queries';
import { getVariantImages } from '../../utils/get-variant-images';
import { ChangeProductStatusAction } from '../actions/change-product-status';
import { EditProductAction } from '../actions/edit';
import { RegisterProductMovementAction } from '../actions/register-movement';
import { ProductGradeSummary } from '../grade-summary';
import { ProductInventoryCard } from '../inventory-card';

import { ProductBasicInfosCard } from './basic-infos-card';
import { ProductImageCarousel } from './image-carousel';
import { ProductNotFound } from './not-found';
import { ProductOptionsSelect } from './options-select';
import { ProductDetailLoading } from './skeleton';

interface ProductDetailsProps {
  productId: string;
}

export function ProductDetailsCard({ productId }: ProductDetailsProps) {
  const { data: product, isLoading } = useProductByIDQuery(productId);
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
      const firstActiveVariant =
        product.variants.find((variant) => variant.isActive) ??
        product.variants[0];
      const initialOptions = firstActiveVariant.options.reduce(
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

  if (isLoading) {
    return <ProductDetailLoading />;
  }

  if (!product) {
    return <ProductNotFound />;
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
    stock,
    isActive
  } = product;

  const displayStock =
    hasVariants && selectedVariant ? selectedVariant.stock : stock;

  const displayMinimumStock =
    hasVariants && selectedVariant
      ? selectedVariant.minimumStock
      : minimumStock;

  const displayCostPrice =
    hasVariants && selectedVariant
      ? selectedVariant.costPrice
      : product.costPrice;

  const carouselImages = !hasVariants
    ? allImages
    : getVariantImages({
        allImages,
        variantImagesId: new Set(selectedVariant?.images.map((img) => img.id)),
        primaryImageVariantId: selectedVariant?.images.find(
          (img) => img.isPrimary
        )?.id
      });

  return (
    <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
      <div>
        <ProductImageCarousel images={carouselImages} />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4 justify-between">
          <ProductBasicInfosCard
            name={name}
            sku={selectedVariant?.sku || sku}
            categories={categories}
            description={description}
            isActive={isActive}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 rounded-lg"
                aria-label="Ações do produto"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <EditProductAction productId={product.id} />
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <RegisterProductMovementAction productId={product.id} />
              </DropdownMenuItem>

              <VisibleTo action="product:delete">
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <ChangeProductStatusAction
                    productId={product.id}
                    isActive={isActive}
                    productName={name}
                  />
                </DropdownMenuItem>
              </VisibleTo>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Variant options selector */}
        {hasVariants && attributes && (
          <ProductOptionsSelect
            attributes={attributes}
            onSelectOption={handleSelectOption}
            selectedOptions={selectedOptions}
          />
        )}

        {/* Inventory + grade summary cards */}
        <div className="flex flex-col gap-3">
          <ProductInventoryCard
            minimumStock={displayMinimumStock}
            stock={displayStock}
            costPrice={displayCostPrice}
          />

          {hasVariants && product.variants.length > 0 && (
            <ProductGradeSummary variants={product.variants} layout="inline" />
          )}
        </div>
      </div>
    </div>
  );
}
