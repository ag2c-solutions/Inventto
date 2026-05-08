import { memo } from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';

import type { IProduct } from '../../../../domain/entities';
import { getImageSrc } from '../../../utils/get-img-src';

type ProductTableColumnImagesProps = {
  images?: IProduct['allImages'];
};

export const ProductTableColumnImages = memo(
  ({ images = [] }: ProductTableColumnImagesProps) => {
    const visibleImages = images.slice(0, 2);
    const hiddenImagesCount = Math.max(images.length - visibleImages.length, 0);

    if (!images.length) {
      return (
        <div className="w-32">
          <Avatar>
            <AvatarFallback>IMG</AvatarFallback>
          </Avatar>
        </div>
      );
    }

    return (
      <div className="*:data-[slot=avatar]:ring-background w-32 flex -space-x-2 *:data-[slot=avatar]:ring-2">
        {visibleImages.map((image) => (
          <Avatar key={image.id}>
            <AvatarImage
              src={getImageSrc(image, 150)}
              alt={image.name}
              className="object-cover"
            />
            <AvatarFallback>IMG</AvatarFallback>
          </Avatar>
        ))}

        {hiddenImagesCount > 0 && (
          <Avatar>
            <AvatarFallback>+{hiddenImagesCount}</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  }
);

ProductTableColumnImages.displayName = 'ProductTableColumnImages';
