import { createCloudinaryThumbnail } from '@/shared/services/image-upload/utils';

import type { IProductImage } from '../../domain/entities';

import { canUseCloudinaryThumbnail } from './can-use-cloudinary-thumbnail';

export function getImageSrc(image: IProductImage, size: number) {
  if (canUseCloudinaryThumbnail(image.publicId)) {
    return createCloudinaryThumbnail(image.publicId, {
      height: size,
      width: size,
      quality: size >= 900 ? 80 : 75
    });
  }

  return image.url;
}
