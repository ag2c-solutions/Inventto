import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type {
  OwnRecentSaleDTO,
  RecentActivityDTO,
  RecentMovementDTO,
  RecentOrderDTO
} from '../../data/dtos';
import type {
  OwnRecentSale,
  RecentActivity,
  RecentMovement,
  RecentOrder
} from '../../domain/entities';

export const recentMovementFactory = Factory.define<RecentMovement>(() => ({
  id: faker.string.uuid(),
  type: faker.helpers.arrayElement(['entry', 'withdrawal']),
  reason: 'Compra',
  totalQuantity: faker.number.int({ min: 1, max: 50 }),
  itemsCount: faker.number.int({ min: 1, max: 5 }),
  executedAt: faker.date.recent()
}));

export const recentOrderFactory = Factory.define<RecentOrder>(() => ({
  id: faker.string.uuid(),
  code: faker.string.alphanumeric(8).toUpperCase(),
  customerName: faker.person.fullName(),
  status: 'confirmed',
  total: faker.number.int({ min: 10, max: 1000 }),
  updatedAt: faker.date.recent()
}));

export const ownRecentSaleFactory = Factory.define<OwnRecentSale>(() => ({
  id: faker.string.uuid(),
  code: faker.string.alphanumeric(8).toUpperCase(),
  itemsCount: faker.number.int({ min: 1, max: 5 }),
  total: faker.number.int({ min: 10, max: 1000 }),
  updatedAt: faker.date.recent()
}));

export const recentActivityFactory = Factory.define<RecentActivity>(() => ({
  recentMovements: recentMovementFactory.buildList(3),
  recentOrders: recentOrderFactory.buildList(3)
}));

export const recentMovementDTOFactory = Factory.define<RecentMovementDTO>(
  () => ({
    id: faker.string.uuid(),
    type: faker.helpers.arrayElement(['entry', 'withdrawal']),
    reason: 'Compra',
    total_quantity: faker.number.int({ min: 1, max: 50 }),
    items_count: faker.number.int({ min: 1, max: 5 }),
    executed_at: faker.date.recent().toISOString()
  })
);

export const recentOrderDTOFactory = Factory.define<RecentOrderDTO>(() => ({
  id: faker.string.uuid(),
  code: faker.string.alphanumeric(8).toUpperCase(),
  customer_name: faker.person.fullName(),
  status: 'confirmed',
  total: faker.number.int({ min: 10, max: 1000 }),
  updated_at: faker.date.recent().toISOString()
}));

export const ownRecentSaleDTOFactory = Factory.define<OwnRecentSaleDTO>(() => ({
  id: faker.string.uuid(),
  code: faker.string.alphanumeric(8).toUpperCase(),
  items_count: faker.number.int({ min: 1, max: 5 }),
  total: faker.number.int({ min: 10, max: 1000 }),
  updated_at: faker.date.recent().toISOString()
}));

export const recentActivityDTOFactory = Factory.define<RecentActivityDTO>(
  () => ({
    recent_movements: recentMovementDTOFactory.buildList(3),
    recent_orders: recentOrderDTOFactory.buildList(3)
  })
);
