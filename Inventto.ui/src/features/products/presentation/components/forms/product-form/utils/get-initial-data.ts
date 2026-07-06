import type { IProduct } from '../../../../../domain/entities';
import { toProductFormData } from '../adapters/to-product-form-data';
import type { ProductFormData } from '../schema';
import type { TProductFormModes } from '../types';

export function getInitialProductFormData({
  draft,
  mode,
  product
}: {
  draft?: ProductFormData | null;
  mode: TProductFormModes;
  product?: IProduct;
}): ProductFormData | undefined {
  const shouldUseDraft = draft && mode === 'Create' && draft.id === undefined;

  if (shouldUseDraft) {
    return draft;
  }

  if (product) {
    return toProductFormData(product);
  }

  return undefined;
}
