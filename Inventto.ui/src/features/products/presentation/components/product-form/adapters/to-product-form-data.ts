import type { IProduct } from '../../../../domain/entities';
import type { ProductFormData } from '../schema';

export function toProductFormData(product: IProduct): ProductFormData {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? '',
    categories: product.categories,
    sku: product.sku,
    minimumStock: product.minimumStock,
    stock: product.stock,
    isActive: product.isActive,
    allImages: product.allImages,
    hasVariants: product.hasVariants,
    attributes: (product.attributes ?? []).map((attribute) => ({
      id: attribute.id,
      name: attribute.name,
      slug: attribute.slug,
      type: attribute.type,
      values: attribute.values
    })),
    variants: product.hasVariants
      ? (product.variants ?? []).map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          stock: variant.stock,
          minimumStock: variant.minimumStock,
          isActive: variant.isActive,
          options: variant.options,
          images: (variant.images ?? []).map((image) => ({
            id: image.id,
            isPrimary: image.isPrimary ?? false
          }))
        }))
      : []
  };
}
