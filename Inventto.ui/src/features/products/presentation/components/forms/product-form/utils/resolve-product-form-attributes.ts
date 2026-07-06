import type { IProductAttribute } from '../../../../../domain/entities';
import type { ProductFormWithVariantsData } from '../schema';

import { generateAttributeSlug } from './generate-attribute-slug';

export function resolveProductFormAttributes(
  attributes: ProductFormWithVariantsData['attributes'] = []
): IProductAttribute[] {
  return attributes.map((attribute) => ({
    id: attribute.id ?? generateAttributeSlug(attribute.name),
    name: attribute.name,
    slug: attribute.slug || generateAttributeSlug(attribute.name),
    type: attribute.type || 'text',
    values: attribute.values
  }));
}
