import type { UpdateProduct } from '../../../../../domain/entities';
import type { ProductFormData } from '../schema';
import { resolveProductFormAttributes } from '../utils/resolve-product-form-attributes';
import { resolveProductFormImages } from '../utils/resolve-product-form-images';

export async function toUpdateProductInput(
  data: ProductFormData
): Promise<Omit<UpdateProduct, 'organizationId'>> {
  const allImages = await resolveProductFormImages(data.allImages);
  const attributes = data.hasVariants
    ? resolveProductFormAttributes(data.attributes)
    : [];

  return {
    id: data.id ?? '',
    name: data.name,
    sku: data.sku,
    description: data.description,
    categories: data.categories,
    minimumStock: data.minimumStock,
    stock: data.stock,
    isActive: data.isActive,
    hasVariants: data.hasVariants,
    allImages,
    attributes,
    variants: data.hasVariants
      ? data.variants.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          stock: variant.stock,
          minimumStock: variant.minimumStock,
          isActive: variant.isActive,
          options: variant.options,
          images: variant.images
        }))
      : []
  };
}
