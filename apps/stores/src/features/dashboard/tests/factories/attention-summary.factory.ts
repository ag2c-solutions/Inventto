import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { AttentionSummaryDTO } from '../../data/dtos';
import type { AttentionSummary } from '../../domain/entities';

export const attentionSummaryFactory = Factory.define<AttentionSummary>(() => ({
  pendingOrders: faker.number.int({ min: 0, max: 20 }),
  lowStock: faker.number.int({ min: 0, max: 20 }),
  expiringSoon: faker.number.int({ min: 0, max: 20 })
}));

export const attentionSummaryDTOFactory = Factory.define<AttentionSummaryDTO>(
  () => ({
    pending_orders: faker.number.int({ min: 0, max: 20 }),
    low_stock: faker.number.int({ min: 0, max: 20 }),
    expiring_soon: faker.number.int({ min: 0, max: 20 })
  })
);
