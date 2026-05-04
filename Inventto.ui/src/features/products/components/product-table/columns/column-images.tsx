import { memo } from 'react';

import type { IProduct } from '@/features/products/types/models';

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import { createCloudinaryThumbnail } from '@/shared/services/image-upload/utils';

type TProductTableColumnImage = {
  productId?: string;
  images: IProduct['allImages'];
};

export const ProductTableColumnImages = memo(
  ({ productId, images }: TProductTableColumnImage) => {
    return (
      <div className="*:data-[slot=avatar]:ring-background w-32 flex -space-x-2 *:data-[slot=avatar]:ring-2">
        {images?.map(
          (image, index) =>
            index < 2 && (
              <Avatar key={`${productId}-${image.name}-${index}`}>
                <AvatarImage
                  src={
                    image.publicId && !image.publicId.startsWith('mock')
                      ? createCloudinaryThumbnail(image.publicId, {
                          height: 150,
                          width: 150,
                          quality: 90
                        })
                      : image.url || 'https://github.com/shadcn.png'
                  }
                  alt={image.name || '@shadcn'}
                  className="object-cover"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            )
        )}
        {images && images.length > 2 && (
          <Avatar>
            <AvatarFallback> + {images.length - 2}</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  }
);
