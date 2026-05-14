export interface CloudinaryUploadDTO {
  public_id: string;
  secure_url: string;
}

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
}

export interface CloudinaryThumbnailOptions {
  width: number;
  height: number;
  quality?: number;
}
