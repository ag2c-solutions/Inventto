import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { NewOrderPayload } from '../../data/dtos';
import type { Notification } from '../../domain/entities';

export const notificationFactory = Factory.define<Notification>(() => ({
  id: faker.string.uuid(),
  type: 'new-order',
  message: faker.lorem.sentence(),
  timestamp: faker.date.recent().toISOString(),
  route: `/pedidos/${faker.string.uuid()}`,
  isRead: false
}));

export const newOrderPayloadFactory = Factory.define<NewOrderPayload>(() => ({
  id: faker.string.uuid(),
  organization_id: faker.string.uuid(),
  created_at: faker.date.recent().toISOString()
}));
