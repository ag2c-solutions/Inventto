import { env } from '@/infra/env';

export const CLOUD_NAME = env.cloudinary.cloudName;
export const UPLOAD_PRESET = env.cloudinary.presetName;
export const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
