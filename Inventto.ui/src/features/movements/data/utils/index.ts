import type { ProductSummaryDTO, VariantSummaryDTO } from '../dtos';

export function formatVariantOptions(
  options?: { name: string; value: string }[] | null
): string | undefined {
  if (!options) return undefined;

  if (Array.isArray(options)) {
    return options
      .filter((opt) => opt && opt.name && opt.value)
      .map((opt) => `${opt.name}: ${opt.value.split('|#')?.[0]}`)
      .join(' · ');
  }

  if (typeof options === 'object') {
    return Object.entries(options)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' · ');
  }

  return String(options);
}

export function getProductImage(
  product?: ProductSummaryDTO | null,
  variant?: VariantSummaryDTO | null
): string | undefined {
  if (variant?.product_variant_images?.length) {
    const primary = variant.product_variant_images.find((i) => i.is_primary);

    if (primary?.product_images?.url) return primary.product_images.url;

    const firstImage = variant.product_variant_images[0]?.product_images;

    if (firstImage?.url) return firstImage.url;
  }

  if (product?.product_images?.length) {
    const primary = product.product_images.find((i) => i.is_primary);

    return primary ? primary.url : product.product_images[0].url;
  }

  return undefined;
}
