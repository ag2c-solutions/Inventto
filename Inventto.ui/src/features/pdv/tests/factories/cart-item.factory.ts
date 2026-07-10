import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { CartItem } from '../../domain/entities';

export const cartItemFactory = Factory.define<CartItem>(() => ({
  productId: faker.string.uuid(),
  name: faker.commerce.productName(),
  sku: faker.string.alphanumeric(8).toUpperCase(),
  imageUrl: faker.image.url(),
  unitPrice: faker.number.int({ min: 1000, max: 50000 }),
  discount: 0,
  quantity: faker.number.int({ min: 1, max: 5 })
}));
