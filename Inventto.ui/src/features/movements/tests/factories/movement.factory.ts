import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type {
  CreateMovementInput,
  CreateMovementItemInput,
  Movement,
  MovementItem
} from '../../domain/entities';

export const movementItemFactory = Factory.define<MovementItem>(() => ({
  id: faker.string.uuid(),
  movementId: faker.string.uuid(),
  productId: faker.string.uuid(),
  variantId: undefined,
  quantity: faker.number.int({ min: 1, max: 10 }),
  unitCost: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
  unitPrice: 0,
  product: {
    name: faker.commerce.productName(),
    imageUrl: faker.image.url(),
    sku: faker.string.alphanumeric(8).toUpperCase()
  }
}));

export const movementFactory = Factory.define<Movement>(() => ({
  id: faker.string.uuid(),
  organizationId: faker.string.uuid(),
  type: 'entry',
  reason: 'Compra',
  documentNumber: undefined,
  orderId: undefined,
  description: undefined,
  createdAt: faker.date.recent(),
  executedAt: faker.date.recent(),
  totalQuantity: 1,
  totalValue: 0,
  user: { fullName: faker.person.fullName() },
  items: [movementItemFactory.build()]
}));

export const createMovementItemInputFactory =
  Factory.define<CreateMovementItemInput>(() => ({
    productId: faker.string.uuid(),
    variantId: null,
    quantity: faker.number.int({ min: 1, max: 10 }),
    unitCost: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
    unitPrice: 0
  }));

export const createMovementInputFactory = Factory.define<CreateMovementInput>(
  () => ({
    type: 'entry',
    reason: 'Compra',
    description: undefined,
    documentNumber: undefined,
    executedAt: faker.date.recent(),
    items: [createMovementItemInputFactory.build()]
  })
);
