import { useEffect, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card';

import type {
  AttributeType,
  IProductImage
} from '../../../../../domain/entities';
import { ProductBasicInfosCard } from '../../../basic-infos-card';
import { ProductImageCarousel } from '../../../image-carousel';
import { ProductInventoryCard } from '../../../inventory-card';
import { ProductOptionsSelect } from '../../../options-select';
import { useProductForm } from '../../hook';
import type {
  ProductFormData,
  ProductFormWithVariantsData
} from '../../schema';

type SummaryCategory = {
  id: string;
  name: string;
};

type SummaryAttribute = {
  id?: string;
  name: string;
  slug?: string;
  type: AttributeType;
  values: string[];
};

function isValidCategory(
  category: ProductFormData['categories'][number]
): category is SummaryCategory {
  return Boolean(category.id && category.name);
}

function isValidImage(
  image: NonNullable<ProductFormData['allImages']>[number]
): image is IProductImage {
  return Boolean(
    image.id &&
      image.url &&
      image.name &&
      image.type &&
      typeof image.isPrimary === 'boolean'
  );
}

function isValidAttribute(
  attribute: ProductFormWithVariantsData['attributes'][number]
): attribute is SummaryAttribute {
  return Boolean(attribute.name && attribute.type && attribute.values);
}

export function ProductSummary() {
  const { form } = useProductForm();

  const name = useWatch({
    control: form.control,
    name: 'name'
  });

  const description = useWatch({
    control: form.control,
    name: 'description'
  });

  const sku = useWatch({
    control: form.control,
    name: 'sku'
  });

  const categoriesValue = useWatch({
    control: form.control,
    name: 'categories'
  });

  const minimumStock = useWatch({
    control: form.control,
    name: 'minimumStock'
  });

  const stock = useWatch({
    control: form.control,
    name: 'stock'
  });

  const allImagesValue = useWatch({
    control: form.control,
    name: 'allImages'
  });

  const hasVariants = useWatch({
    control: form.control,
    name: 'hasVariants'
  });

  const attributesValue = useWatch({
    control: form.control,
    name: 'attributes'
  });

  const variants = useWatch({
    control: form.control,
    name: 'variants'
  });

  const categories = useMemo(() => {
    return (categoriesValue ?? []).filter(isValidCategory);
  }, [categoriesValue]);

  const allImages = useMemo(() => {
    return (allImagesValue ?? []).filter(isValidImage);
  }, [allImagesValue]);

  const attributes = useMemo(() => {
    return (attributesValue ?? []).filter(isValidAttribute);
  }, [attributesValue]);

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    setSelectedOptions((previousOptions) => {
      const nextSelectedOptions: Record<string, string> = {};

      attributes.forEach((attribute) => {
        const currentSelectedValue = previousOptions[attribute.name];

        const hasCurrentValue =
          currentSelectedValue &&
          attribute.values.includes(currentSelectedValue);

        const firstValue = attribute.values[0];

        if (hasCurrentValue) {
          nextSelectedOptions[attribute.name] = currentSelectedValue;
          return;
        }

        if (firstValue) {
          nextSelectedOptions[attribute.name] = firstValue;
        }
      });

      return nextSelectedOptions;
    });
  }, [attributes]);

  const handleSelectOption = (attributeName: string, value: string) => {
    setSelectedOptions((previousOptions) => ({
      ...previousOptions,
      [attributeName]: value
    }));
  };

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return undefined;

    return variants.find((variant) => {
      return variant.options.every((option) => {
        if (!option.name || !option.value) return false;

        return selectedOptions[option.name] === option.value;
      });
    });
  }, [hasVariants, selectedOptions, variants]);

  const selectedVariantImages = useMemo<IProductImage[]>(() => {
    if (!selectedVariant) return [];

    const images = allImages.reduce<IProductImage[]>((accumulator, image) => {
      const variantImageConfig = selectedVariant.images.find(
        (variantImage) => variantImage.id === image.id
      );

      if (!variantImageConfig) {
        return accumulator;
      }

      accumulator.push({
        ...image,
        isPrimary: variantImageConfig.isPrimary ?? false
      });

      return accumulator;
    }, []);

    return images.sort((current, next) => {
      if (current.isPrimary === next.isPrimary) return 0;

      return current.isPrimary ? -1 : 1;
    });
  }, [selectedVariant, allImages]);

  const imagesToDisplay = hasVariants ? selectedVariantImages : allImages;
  const showCarousel = imagesToDisplay.length > 0;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Resumo do Produto</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex h-full w-full items-center justify-center rounded-md bg-muted text-muted-foreground">
            {showCarousel ? (
              <ProductImageCarousel images={imagesToDisplay} />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm">
                Sem imagens
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between">
            <section className="flex flex-col gap-4 space-y-4">
              <ProductBasicInfosCard
                name={name}
                sku={selectedVariant?.sku ?? sku}
                categories={categories}
                description={description}
              />

              {hasVariants && attributes.length > 0 && (
                <ProductOptionsSelect
                  attributes={attributes}
                  selectedOptions={selectedOptions}
                  onSelectOption={handleSelectOption}
                />
              )}
            </section>

            <section className="flex flex-col gap-3">
              {hasVariants && selectedVariant ? (
                <ProductInventoryCard
                  minimumStock={selectedVariant.minimumStock}
                  stock={selectedVariant.stock}
                />
              ) : (
                <ProductInventoryCard
                  minimumStock={minimumStock}
                  stock={stock}
                />
              )}

              <p className="text-xs text-muted-foreground">
                O estoque inicial é 0. Você poderá adicionar estoque na tela de
                "Movimentações" após salvar o produto.
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
