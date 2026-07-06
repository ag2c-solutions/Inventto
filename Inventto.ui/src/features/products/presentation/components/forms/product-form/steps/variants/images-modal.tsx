import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';

import { ImageCard } from '@/shared/components/common/image-card';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { cn } from '@/shared/utils';

import { getImageSrc } from '../../../../../utils/get-img-src';
import { VariantOptionBadge } from '../../../../variants-options-badge';
import type { ProductFormData } from '../../schema';

type ImagesModalProps = {
  variantIndex: number;
};

type ProductFormImage = NonNullable<ProductFormData['allImages']>[number];

const fieldStateOptions = {
  shouldDirty: true,
  shouldTouch: true,
  shouldValidate: true
} as const;

const EMPTY_IMAGES: ProductFormImage[] = [];

export function ImagesModal({ variantIndex }: ImagesModalProps) {
  const { control, getValues, setValue } = useFormContext<ProductFormData>();
  const watchedAllImages = useWatch({
    control,
    name: 'allImages'
  });

  const allImages = watchedAllImages ?? EMPTY_IMAGES;

  const productName = useWatch({
    control,
    name: 'name'
  });

  const currentVariant = useWatch({
    control,
    name: `variants.${variantIndex}`
  });

  const [selectedImages, setSelectedImages] = useState<ProductFormImage[]>([]);
  const [enableReplication, setEnableReplication] = useState(false);
  const [replicationOption, setReplicationOption] = useState('');

  const availableImages = useMemo(() => {
    const currentImageIds = new Set(
      currentVariant?.images?.map((image) => image.id) ?? []
    );

    return allImages.filter((image) => !currentImageIds.has(image.id));
  }, [allImages, currentVariant?.images]);

  const replicationOptions = useMemo(() => {
    return (
      currentVariant?.options?.map((option) => ({
        id: `${option.name}:${option.value}`,
        label: 'Todas as variações:',
        values: option
      })) ?? []
    );
  }, [currentVariant?.options]);

  const handleToggleImage = (image: ProductFormImage) => {
    setSelectedImages((previousImages) => {
      const isSelected = previousImages.some(
        (selectedImage) => selectedImage.id === image.id
      );

      if (isSelected) {
        return previousImages.filter(
          (selectedImage) => selectedImage.id !== image.id
        );
      }

      return [...previousImages, image];
    });
  };

  const addImagesToVariant = (
    targetVariantIndex: number,
    selectedImageIds: string[]
  ) => {
    const currentImages =
      getValues(`variants.${targetVariantIndex}.images`) ?? [];

    const currentImageIds = new Set(currentImages.map((image) => image.id));

    const newImages = selectedImageIds
      .filter((imageId) => !currentImageIds.has(imageId))
      .map((imageId, index) => ({
        id: imageId,
        isPrimary: index === 0 && currentImages.length === 0
      }));

    if (!newImages.length) return;

    setValue(
      `variants.${targetVariantIndex}.images`,
      [...currentImages, ...newImages],
      fieldStateOptions
    );
  };

  const handleConfirm = () => {
    const selectedImageIds = selectedImages.map((image) => image.id);

    if (!selectedImageIds.length) return;

    if (!enableReplication) {
      addImagesToVariant(variantIndex, selectedImageIds);
      return;
    }

    if (!replicationOption) return;

    const [attributeName, attributeValue] = replicationOption.split(':');
    const variants = getValues('variants') ?? [];

    variants.forEach((variant, index) => {
      const matchesRule = variant.options.some(
        (option) =>
          option.name === attributeName && option.value === attributeValue
      );

      if (matchesRule) {
        addImagesToVariant(index, selectedImageIds);
      }
    });
  };

  const confirmDisabled =
    selectedImages.length === 0 || (enableReplication && !replicationOption);

  const selectionCount = selectedImages.length;
  const selectionLabel =
    selectionCount === 1
      ? `${selectionCount} imagem`
      : `${selectionCount} imagens`;

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Associar imagens à variação</DialogTitle>

        <DialogDescription asChild>
          <span>
            Selecione uma ou mais imagens da galeria de{' '}
            <strong className="text-foreground font-semibold">
              {productName || 'produto'}
            </strong>
            .
          </span>
        </DialogDescription>

        {currentVariant?.options?.length ? (
          <div className="flex gap-2 pt-1 flex-wrap">
            {currentVariant.options.map((option) => (
              <VariantOptionBadge
                key={`${option.name}-${option.value}`}
                option={option}
              />
            ))}
          </div>
        ) : null}
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid max-h-96 grid-cols-3 gap-3 overflow-y-auto rounded-xl border p-4 md:grid-cols-5">
          {availableImages.map((image) => {
            const isSelected = selectedImages.some(
              (selectedImage) => selectedImage.id === image.id
            );

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => handleToggleImage(image)}
                className={cn(
                  'relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 transition-colors',
                  isSelected
                    ? 'border-foreground'
                    : 'border-transparent hover:border-muted-foreground/30'
                )}
                aria-pressed={isSelected}
                aria-label={`Selecionar imagem ${image.name}`}
              >
                <ImageCard src={getImageSrc(image, 150)} alt={image.name} />

                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex size-8 items-center justify-center rounded-full bg-foreground text-background shadow-md">
                      <Check className="size-4" strokeWidth={3} />
                    </div>
                  </div>
                )}
              </button>
            );
          })}

          {availableImages.length === 0 && (
            <p className="col-span-full py-4 text-center text-sm text-muted-foreground">
              Todas as imagens já foram associadas a esta variante.
            </p>
          )}
        </div>

        <div className="rounded-xl border p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="replicate-check"
              checked={enableReplication}
              onCheckedChange={(checked) => {
                const enabled = Boolean(checked);
                setEnableReplication(enabled);
                if (!enabled) setReplicationOption('');
              }}
              disabled={selectedImages.length === 0}
            />
            <Label
              htmlFor="replicate-check"
              className={cn(
                'text-sm cursor-pointer',
                selectedImages.length === 0 &&
                  'text-muted-foreground cursor-not-allowed'
              )}
            >
              Replicar esta seleção ({selectionLabel}) para:
            </Label>
          </div>

          {enableReplication && (
            <RadioGroup
              value={replicationOption}
              onValueChange={setReplicationOption}
              className="pl-7 space-y-3"
            >
              {replicationOptions.map((option) => (
                <div key={option.id} className="flex items-center gap-3">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label
                    htmlFor={option.id}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <span className="text-muted-foreground">
                      {option.label}
                    </span>
                    <VariantOptionBadge option={option.values} />
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </DialogClose>

        <DialogClose asChild>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={confirmDisabled}
          >
            Confirmar seleção
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
