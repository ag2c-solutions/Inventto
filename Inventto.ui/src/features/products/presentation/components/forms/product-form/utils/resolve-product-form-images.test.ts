import { describe, expect, it, vi } from 'vitest';

const { mockUploadImage } = vi.hoisted(() => ({
  mockUploadImage: vi.fn()
}));

vi.mock('@/infra/cloudinary', () => ({
  CloudinaryService: {
    uploadImage: mockUploadImage
  }
}));

import { resolveProductFormImages } from './resolve-product-form-images';

describe('resolveProductFormImages', () => {
  it('should return an empty array when no images are provided', async () => {
    expect(await resolveProductFormImages(undefined)).toEqual([]);
  });

  it('should keep existing images without uploading', async () => {
    const result = await resolveProductFormImages([
      {
        id: 'img-1',
        name: 'existing.png',
        url: 'https://cdn.test/existing.png',
        type: 'image/png',
        publicId: 'pub-1',
        isPrimary: true
      } as never
    ]);

    expect(mockUploadImage).not.toHaveBeenCalled();
    expect(result[0]).toMatchObject({
      id: 'img-1',
      url: 'https://cdn.test/existing.png',
      publicId: 'pub-1'
    });
  });

  it('should upload new File images to Cloudinary', async () => {
    mockUploadImage.mockResolvedValue({
      publicId: 'new-pub-id',
      url: 'https://cdn.test/new.png'
    });

    const file = new File(['content'], 'new.png', { type: 'image/png' });

    const result = await resolveProductFormImages([
      {
        id: 'img-2',
        name: 'new.png',
        file,
        type: 'image/png',
        isPrimary: false
      } as never
    ]);

    expect(mockUploadImage).toHaveBeenCalledWith(file);
    expect(result[0]).toMatchObject({
      id: 'img-2',
      url: 'https://cdn.test/new.png',
      publicId: 'new-pub-id'
    });
  });

  it('should sort images putting the primary one first', async () => {
    const result = await resolveProductFormImages([
      {
        id: 'img-a',
        name: 'a.png',
        url: 'url-a',
        type: 'image/png',
        isPrimary: false
      } as never,
      {
        id: 'img-b',
        name: 'b.png',
        url: 'url-b',
        type: 'image/png',
        isPrimary: true
      } as never
    ]);

    expect(result[0].id).toBe('img-b');
  });
});
