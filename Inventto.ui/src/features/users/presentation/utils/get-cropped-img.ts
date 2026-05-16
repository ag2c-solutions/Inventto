import type { PixelCrop } from '../../domain/entities';

import { createImage } from './create-image';

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop
): Promise<File | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(null);
        return;
      }

      const file = new File([blob], 'avatar-cropped.jpeg', {
        type: 'image/jpeg'
      });

      resolve(file);
    }, 'image/jpeg');
  });
}
