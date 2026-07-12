import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { OrderDTO } from '../../data/dtos';
import type { Order } from '../../domain/entities';

export const orderFactory = Factory.define<Order>(() => ({
  id: faker.string.uuid(),
  code: faker.string.alphanumeric(8).toUpperCase(),
  customerName: faker.person.fullName(),
  customerPhone: faker.phone.number(),
  items: [
    {
      productId: faker.string.uuid(),
      name: faker.commerce.productName(),
      quantity: 1,
      unitPrice: 100
    }
  ],
  total: 100,
  macroState: 'pool',
  microState: 'pending',
  channel: 'catalog_store',
  receivedAt: new Date('2026-07-10T10:00:00Z'),
  lastActionAt: new Date('2026-07-10T10:00:00Z')
}));

export const orderDTOFactory = Factory.define<OrderDTO>(() => ({
  id: faker.string.uuid(),
  organization_id: faker.string.uuid(),
  customer_id: faker.string.uuid(),
  seller_id: null,
  customer_name_snapshot: faker.person.fullName(),
  customer_phone_snapshot: faker.phone.number(),
  channel: 'catalog_store',
  catalog_id: faker.string.uuid(),
  status: 'pending',
  total_amount: 100,
  payment_method: null,
  delivery_address: null,
  cancellation_reason: null,
  claimed_at: null,
  finalized_at: null,
  expires_at: null,
  created_at: '2026-07-10T10:00:00Z',
  updated_at: '2026-07-10T10:00:00Z',
  seller: null,
  order_items: [
    {
      id: faker.string.uuid(),
      product_id: faker.string.uuid(),
      variant_id: null,
      quantity: 1,
      unit_price: 100,
      product_name_snapshot: faker.commerce.productName()
    }
  ],
  catalog: { name: faker.commerce.department() }
}));
