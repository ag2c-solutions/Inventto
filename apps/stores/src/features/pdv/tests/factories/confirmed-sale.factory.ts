import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { ConfirmedSale } from '../../domain/entities';

import { cartItemFactory } from './cart-item.factory';

export const confirmedSaleFactory = Factory.define<ConfirmedSale>(() => ({
  orderId: faker.string.uuid(),
  organizationName: faker.company.name(),
  confirmedAt: faker.date.recent(),
  items: cartItemFactory.buildList(2),
  subtotal: 10000,
  discountTotal: 0,
  total: 10000,
  paymentMethod: 'card',
  amountPaid: undefined,
  changeAmount: undefined,
  customer: undefined
}));
