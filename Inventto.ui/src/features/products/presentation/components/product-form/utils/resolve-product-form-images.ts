import { CloudinaryService } from '@/infra/cloudinary';

import type { IProductImage } from '../../../../domain/entities';
import type { ProductFormData } from '../schema';

type ProductFormImage = ProductFormData['allImages'][number];

export async function resolveProductFormImages(
  images: ProductFormImage[] = []
): Promise<IProductImage[]> {
  const resolvedImages = await Promise.all(
    images.map(async (image) => {
      if (image.file instanceof File) {
        const { publicId, url } = await CloudinaryService.uploadImage(
          image.file
        );

        return {
          id: image.id,
          name: image.name,
          url,
          type: image.type,
          publicId,
          isPrimary: image.isPrimary
        };
      }

      return {
        id: image.id,
        name: image.name,
        url: image.url,
        type: image.type,
        publicId: image.publicId,
        isPrimary: image.isPrimary
      };
    })
  );

  return resolvedImages.sort((current, next) => {
    if (current.isPrimary) return -1;
    if (next.isPrimary) return 1;

    return 0;
  });
}
