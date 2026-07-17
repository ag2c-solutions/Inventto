import { type MouseEvent, useEffect, useState } from 'react';

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/shared/components/ui/carousel';
import { cn } from '@/shared/utils';

import type { IProductImage } from '../../../../domain/entities';
import { getImageSrc } from '../../../utils/get-img-src';

type ProductImageCarouselProps = {
  images?: IProductImage[];
};

export function ProductImageCarousel({ images }: ProductImageCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    const updateCurrent = () => {
      setCurrent(api.selectedScrollSnap() + 1);
    };

    setCount(api.scrollSnapList().length);
    updateCurrent();

    api.on('select', updateCurrent);

    return () => {
      api.off('select', updateCurrent);
    };
  }, [api]);

  const handleThumbnailClick = (
    event: MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.preventDefault();
    api?.scrollTo(index);
  };

  if (!images?.length) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Main image */}
      <div className="relative rounded-xl overflow-hidden bg-muted aspect-square">
        <Carousel setApi={setApi} className="h-full w-full">
          <CarouselContent className="h-full">
            {images.map((image) => {
              const imageSrc = getImageSrc(image, 900);

              return (
                <CarouselItem className="h-full" key={image.id}>
                  <div className="h-full bg-muted overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={image.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <CarouselPrevious
            type="button"
            className="left-3 size-8 bg-background/80 hover:bg-background border-border/50 shadow-sm"
          />

          <CarouselNext
            type="button"
            className="right-3 size-8 bg-background/80 hover:bg-background border-border/50 shadow-sm"
          />
        </Carousel>
      </div>

      {/* Dot indicators */}
      {count > 1 && (
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => handleThumbnailClick(e, index)}
              aria-label={`Ir para imagem ${index + 1}`}
              className={cn(
                'rounded-full transition-all duration-200',
                index === current - 1
                  ? 'bg-foreground w-4 h-2'
                  : 'bg-muted-foreground/40 w-2 h-2'
              )}
            />
          ))}
        </div>
      )}

      {/* Thumbnails */}
      <div className="flex gap-2">
        {images.map((image, index) => {
          const isActive = index === current - 1;
          const imageSrc = getImageSrc(image, 150);

          return (
            <button
              key={image.id}
              type="button"
              onClick={(event) => handleThumbnailClick(event, index)}
              className={cn(
                'relative aspect-square w-16 rounded-lg overflow-hidden transition-all duration-200 flex-shrink-0 border-2',
                isActive
                  ? 'border-foreground'
                  : 'border-transparent hover:border-muted-foreground/40'
              )}
              aria-label={`Ir para imagem ${index + 1}`}
              aria-current={isActive}
            >
              <img
                src={imageSrc}
                alt={image.name}
                className="h-full w-full object-cover"
              />

              {!isActive && (
                <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors duration-200" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
