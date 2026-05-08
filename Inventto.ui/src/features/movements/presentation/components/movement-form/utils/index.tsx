import type { IProduct } from '@/features/products';

export const getMovementItemImage = (
  product: IProduct | null | undefined,
  variantId?: string | null
): string => {
  const PLACEHOLDER = '/placeholder.svg';
  if (!product || !product.allImages?.length) return PLACEHOLDER;

  const allImages = product.allImages;
  const variant = variantId
    ? product.variants?.find((v) => v.id === variantId)
    : null;
  const variantImgRef =
    variant?.images?.find((img) => img.isPrimary) || variant?.images?.[0];
  const variantImage = variantImgRef
    ? allImages.find((img) => img.id === variantImgRef.id)
    : null;
  const primaryProductImage = allImages.find((img) => img.isPrimary);

  return (
    variantImage?.url ||
    primaryProductImage?.url ||
    allImages[0]?.url ||
    PLACEHOLDER
  );
};
