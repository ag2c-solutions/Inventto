import { describe, expect, it } from 'vitest';

import { canUseCloudinaryThumbnail } from './can-use-cloudinary-thumbnail';

describe('canUseCloudinaryThumbnail', () => {
  it('should return false when publicId is undefined', () => {
    expect(canUseCloudinaryThumbnail(undefined)).toBe(false);
  });

  it('should return false when publicId is an empty/blank string', () => {
    expect(canUseCloudinaryThumbnail('   ')).toBe(false);
  });

  it('should return false when publicId starts with "mock"', () => {
    expect(canUseCloudinaryThumbnail('mock-image-123')).toBe(false);
  });

  it('should return false when publicId starts with the placeholder URL', () => {
    expect(canUseCloudinaryThumbnail('https://placehold.co/600x400')).toBe(
      false
    );
  });

  it('should return true for a valid Cloudinary publicId', () => {
    expect(canUseCloudinaryThumbnail('products/abc123')).toBe(true);
  });
});
