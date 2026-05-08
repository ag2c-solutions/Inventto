import type { ProductFormData } from '../schema';

export function getEmptyProductFormValues(): ProductFormData {
  return {
    id: '',
    name: '',
    description: '',
    categories: [],
    sku: '',
    minimumStock: 0,
    stock: 0,
    isActive: true,
    allImages: [],
    hasVariants: false
  };
}
