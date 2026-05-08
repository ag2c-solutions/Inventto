import { type MouseEvent, useEffect, useState } from 'react';

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/shared/components/ui/carousel';

import type { IProductImage } from '../../../domain/entities';
import { getImageSrc } from '../../utils/get-img-src';

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
    <div className="w-full h-full max-w-4xl mx-auto space-y-4">
      <div className="relative h-10/12 rounded-lg overflow-hidden">
        <Carousel setApi={setApi} className="h-full w-full">
          <CarouselContent className="h-full">
            {images.map((image) => {
              const imageSrc = getImageSrc(image, 900);

              return (
                <CarouselItem className="h-full" key={image.id}>
                  <div className="h-full bg-muted rounded-lg overflow-hidden">
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
            className="left-4 bg-primary/80 hover:bg-primary text-primary-foreground"
          />

          <CarouselNext
            type="button"
            className="right-4 bg-primary/80 hover:bg-primary text-primary-foreground"
          />
        </Carousel>

        <div className="absolute top-4 right-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
          {current} / {count}
        </div>
      </div>

      <div className="flex justify-center gap-3 flex-wrap px-4">
        {images.map((image, index) => {
          const isActive = index === current - 1;
          const imageSrc = getImageSrc(image, 150);

          return (
            <button
              key={image.id}
              type="button"
              onClick={(event) => handleThumbnailClick(event, index)}
              className={`relative w-16 h-12 rounded-md overflow-hidden transition-all duration-300 flex-shrink-0 border-2 ${
                isActive
                  ? 'border-primary shadow-lg scale-105'
                  : 'border-transparent hover:border-muted-foreground'
              }`}
              aria-label={`Ir para imagem ${index + 1}`}
              aria-current={isActive}
            >
              <img
                src={imageSrc}
                alt={image.name}
                className="h-full w-full object-cover"
              />

              {!isActive && (
                <div className="absolute inset-0 bg-black/30 hover:bg-black/10 transition-colors duration-200" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
