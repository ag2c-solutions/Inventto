import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { MovementFormData } from '.';

/**
 * Test-only factory for the wizard's in-flight batch item shape
 * (`MovementFormData['items'][number]`). Lives beside the schema, not in the
 * feature's shared `tests/factories/`, since that folder is reserved for
 * Domain/DTO factories and this type is presentation-layer only.
 */
export const movementBatchItemFactory = Factory.define<
  MovementFormData['items'][number]
>(() => ({
  productId: faker.string.uuid(),
  productName: faker.commerce.productName(),
  variantId: null,
  currentStock: faker.number.int({ min: 1, max: 50 }),
  unitCost: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
  unitPrice: 0,
  quantity: faker.number.int({ min: 1, max: 10 })
}));
