import { describe, expect, it } from 'vitest';

import { productImageFactory } from '../../tests/factories/product.factory';

import { getVariantImages } from './get-variant-images';

describe('getVariantImages', () => {
  it('should return only the images referenced by variantImagesId', () => {
    const imageA = productImageFactory.build({ id: 'img-a' });
    const imageB = productImageFactory.build({ id: 'img-b' });
    const imageC = productImageFactory.build({ id: 'img-c' });

    const result = getVariantImages({
      allImages: [imageA, imageB, imageC],
      variantImagesId: new Set(['img-a', 'img-c'])
    });

    expect(result?.map((image) => image.id)).toEqual(['img-a', 'img-c']);
  });

  it('should mark the primaryImageVariantId image as primary', () => {
    const imageA = productImageFactory.build({ id: 'img-a', isPrimary: false });
    const imageB = productImageFactory.build({ id: 'img-b', isPrimary: false });

    const result = getVariantImages({
      allImages: [imageA, imageB],
      variantImagesId: new Set(['img-a', 'img-b']),
      primaryImageVariantId: 'img-b'
    });

    expect(result?.find((image) => image.id === 'img-b')?.isPrimary).toBe(true);
    expect(result?.find((image) => image.id === 'img-a')?.isPrimary).toBe(
      false
    );
  });

  it('should sort the primary image first', () => {
    const imageA = productImageFactory.build({ id: 'img-a' });
    const imageB = productImageFactory.build({ id: 'img-b' });

    const result = getVariantImages({
      allImages: [imageA, imageB],
      variantImagesId: new Set(['img-a', 'img-b']),
      primaryImageVariantId: 'img-b'
    });

    expect(result?.[0].id).toBe('img-b');
  });

  it('should return an empty array when allImages is undefined', () => {
    const result = getVariantImages({
      allImages: undefined as never,
      variantImagesId: new Set()
    });

    expect(result).toBeUndefined();
  });
});
