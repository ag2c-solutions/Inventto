import { beforeEach, describe, expect, it, vi } from 'vitest';

import { productImageFactory } from '../../tests/factories/product.factory';

const { mockCreateThumbnail } = vi.hoisted(() => ({
  mockCreateThumbnail: vi.fn((publicId) => `thumb/${publicId}`)
}));

vi.mock('@/infra/cloudinary', () => ({
  CloudinaryService: {
    createThumbnail: mockCreateThumbnail
  }
}));

import { getImageSrc } from './get-img-src';

describe('getImageSrc', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should build a Cloudinary thumbnail when publicId is usable', () => {
    const image = productImageFactory.build({ publicId: 'products/abc123' });

    const result = getImageSrc(image, 150);

    expect(mockCreateThumbnail).toHaveBeenCalledWith('products/abc123', {
      height: 150,
      width: 150,
      quality: 75
    });
    expect(result).toBe('thumb/products/abc123');
  });

  it('should use higher quality for large sizes', () => {
    const image = productImageFactory.build({ publicId: 'products/abc123' });

    getImageSrc(image, 900);

    expect(mockCreateThumbnail).toHaveBeenCalledWith('products/abc123', {
      height: 900,
      width: 900,
      quality: 80
    });
  });

  it('should fall back to image.url when publicId is not usable', () => {
    const image = productImageFactory.build({
      publicId: undefined,
      url: 'https://cdn.test/image.png'
    });

    const result = getImageSrc(image, 150);

    expect(mockCreateThumbnail).not.toHaveBeenCalled();
    expect(result).toBe('https://cdn.test/image.png');
  });

  it('should fall back to the shadcn placeholder when there is no publicId nor url', () => {
    const image = productImageFactory.build({
      publicId: undefined,
      url: ''
    });

    const result = getImageSrc(image, 150);

    expect(result).toBe('https://github.com/shadcn.png');
  });
});
