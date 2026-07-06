import type { ProductFormData } from '../schema';

import { getEmptyProductFormValues } from './get-empty-product-form-values';

export function getProductFormDefaultValues(
  productFormData?: ProductFormData
): ProductFormData {
  if (!productFormData) {
    return getEmptyProductFormValues();
  }

  if (!productFormData.hasVariants) {
    return {
      id: productFormData.id ?? '',
      name: productFormData.name ?? '',
      description: productFormData.description ?? '',
      categories: productFormData.categories ?? [],
      sku: productFormData.sku ?? '',
      minimumStock: productFormData.minimumStock ?? 0,
      stock: productFormData.stock ?? 0,
      isActive: productFormData.isActive ?? true,
      allImages: productFormData.allImages ?? [],
      hasVariants: false
    };
  }

  return {
    id: productFormData.id ?? '',
    name: productFormData.name ?? '',
    description: productFormData.description ?? '',
    categories: productFormData.categories ?? [],
    sku: productFormData.sku ?? '',
    minimumStock: productFormData.minimumStock ?? 0,
    stock: productFormData.stock ?? 0,
    isActive: productFormData.isActive ?? true,
    allImages: productFormData.allImages ?? [],
    hasVariants: productFormData.hasVariants,
    attributes: productFormData.attributes ?? [],
    variants: productFormData.variants ?? []
  };
}
