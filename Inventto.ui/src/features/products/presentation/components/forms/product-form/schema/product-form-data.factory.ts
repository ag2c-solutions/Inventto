import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { ProductFormData, ProductFormWithVariantsData } from '.';

/**
 * Factory colocalizada (não em `tests/factories/`): `ProductFormData` é um
 * tipo presentation-only (schema do formulário), e `eslint-plugin-boundaries`
 * proíbe `tests/` de depender de `presentation/`. Mesmo padrão já usado em
 * `organizations` (`organization-settings-form-data.factory.ts`).
 */
export const productFormDataFactory = Factory.define<ProductFormData>(() => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  sku: faker.string.alphanumeric(8).toUpperCase(),
  description: faker.commerce.productDescription(),
  categories: [{ id: faker.string.uuid(), name: faker.commerce.department() }],
  minimumStock: faker.number.int({ min: 0, max: 10 }),
  stock: faker.number.int({ min: 0, max: 100 }),
  isActive: true,
  hasVariants: false,
  allImages: []
}));

export const productFormWithVariantsDataFactory =
  Factory.define<ProductFormWithVariantsData>(() => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    sku: faker.string.alphanumeric(8).toUpperCase(),
    description: faker.commerce.productDescription(),
    categories: [
      { id: faker.string.uuid(), name: faker.commerce.department() }
    ],
    minimumStock: faker.number.int({ min: 0, max: 10 }),
    stock: faker.number.int({ min: 0, max: 100 }),
    isActive: true,
    hasVariants: true,
    attributes: [
      {
        id: faker.string.uuid(),
        name: 'Cor',
        slug: 'cor',
        type: 'text',
        values: ['Azul'],
        isNew: false
      }
    ],
    variants: [
      {
        id: faker.string.uuid(),
        sku: faker.string.alphanumeric(8).toUpperCase(),
        minimumStock: 0,
        stock: 0,
        isActive: true,
        options: [{ name: 'Cor', value: 'Azul' }],
        images: []
      }
    ],
    allImages: []
  }));
