import { useState } from 'react';
import { ImagePlus, Star, X } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';

import { ImageCard } from '@/shared/components/common/image-card';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogTrigger } from '@/shared/components/ui/dialog';

import { getImageSrc } from '../../../../utils/get-img-src';
import type { ProductFormData } from '../../schema';

import { ImagesModal } from './images-modal';

type ProductFormFieldVariantImagesProps = {
  variantIndex: number;
};

const fieldStateOptions = {
  shouldDirty: true,
  shouldTouch: true,
  shouldValidate: true
} as const;

export function ProductFormFieldVariantImages({
  variantIndex
}: ProductFormFieldVariantImagesProps) {
  const { control, setValue } = useFormContext<ProductFormData>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allImages =
    useWatch({
      control,
      name: 'allImages'
    }) ?? [];

  const currentVariantImages =
    useWatch({
      control,
      name: `variants.${variantIndex}.images`
    }) ?? [];

  const handleSetPrimaryCard = (imageId: string) => {
    const newImages = currentVariantImages
      .map((image) => ({
        ...image,
        isPrimary: image.id === imageId
      }))
      .sort((current, next) => {
        if (current.isPrimary === next.isPrimary) return 0;

        return current.isPrimary ? -1 : 1;
      });

    setValue(`variants.${variantIndex}.images`, newImages, fieldStateOptions);
  };

  const handleRemoveImage = (imageId: string) => {
    const wasPrimary = currentVariantImages.some(
      (image) => image.id === imageId && image.isPrimary
    );

    const newImages = currentVariantImages.filter(
      (image) => image.id !== imageId
    );

    if (wasPrimary && newImages.length > 0) {
      newImages[0] = {
        ...newImages[0],
        isPrimary: true
      };
    }

    setValue(`variants.${variantIndex}.images`, newImages, fieldStateOptions);
  };

  return (
    <>
      {currentVariantImages.map((image) => {
        const fullImageFile = allImages.find(
          (productImage) => productImage.id === image.id
        );

        if (!fullImageFile) return null;

        return (
          <div
            key={image.id}
            className="group relative w-12 h-12 rounded-md overflow-clip"
          >
            <ImageCard
              src={getImageSrc(fullImageFile, 150)}
              alt={fullImageFile.name}
              showSkeleton={false}
            />

            {image.isPrimary && (
              <div className="absolute top-0 right-0 p-0.5 bg-black/50 rounded-bl-md">
                <Star className="size-3 text-yellow-400 fill-yellow-400" />
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center gap-0.5 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              {!image.isPrimary && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-5 text-white hover:text-yellow-400"
                  onClick={(event) => {
                    event.preventDefault();
                    handleSetPrimaryCard(image.id);
                  }}
                  aria-label="Definir como imagem principal"
                >
                  <Star className="size-4" />
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-5 text-white hover:text-destructive"
                onClick={(event) => {
                  event.preventDefault();
                  handleRemoveImage(image.id);
                }}
                aria-label="Remover imagem"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        );
      })}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-12 h-12"
            aria-label="Adicionar imagens à variação"
          >
            <ImagePlus className="size-5" />
          </Button>
        </DialogTrigger>

        {isModalOpen && <ImagesModal variantIndex={variantIndex} />}
      </Dialog>
    </>
  );
}
