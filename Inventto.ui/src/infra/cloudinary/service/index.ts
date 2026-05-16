import { thumbnail } from '@cloudinary/url-gen/actions/resize';
import { Cloudinary } from '@cloudinary/url-gen/index';
import { xyCenter } from '@cloudinary/url-gen/qualifiers/gravity';

import { CLOUD_NAME, UPLOAD_PRESET, UPLOAD_URL } from '../constants';
import type {
  CloudinaryThumbnailOptions,
  CloudinaryUploadDTO,
  CloudinaryUploadResult
} from '../types';

export class CloudinaryService {
  private static readonly cld = new Cloudinary({
    cloud: { cloudName: CLOUD_NAME }
  });

  public static async uploadImage(file: File): Promise<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `Erro HTTP: ${response.status}`
        );
      }

      const data = (await response.json()) as CloudinaryUploadDTO;

      return {
        publicId: data.public_id,
        url: data.secure_url
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Falha no upload: ${error.message}`);
      }

      throw new Error('Erro desconhecido no upload de imagem');
    }
  }

  public static createThumbnail(
    publicId: string | null | undefined,
    options: CloudinaryThumbnailOptions
  ): string {
    if (!publicId) {
      return '';
    }

    const { width, height, quality = 80 } = options;
    const myImage = this.cld.image(publicId);

    myImage
      .resize(thumbnail().width(width).height(height).gravity(xyCenter()))
      .format('auto')
      .quality(quality);

    return myImage.toURL();
  }
}
