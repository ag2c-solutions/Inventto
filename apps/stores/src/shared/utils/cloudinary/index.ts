import type {
  CloudinaryThumbnailOptions,
  CloudinaryUploadResult
} from '@/infra/cloudinary';
import { CloudinaryService } from '@/infra/cloudinary';

export function createCloudinaryThumbnail(
  publicId: string | null | undefined,
  options: CloudinaryThumbnailOptions
): string {
  return CloudinaryService.createThumbnail(publicId, options);
}

export function uploadCloudinaryImage(
  file: File
): Promise<CloudinaryUploadResult> {
  return CloudinaryService.uploadImage(file);
}
