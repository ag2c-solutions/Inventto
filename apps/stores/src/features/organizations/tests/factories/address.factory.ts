import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { IAddress } from '../../domain/entities';

export const addressFactory = Factory.define<IAddress>(() => ({
  zip: '01310-100',
  street: faker.location.street(),
  number: faker.location.buildingNumber(),
  complement: undefined,
  district: faker.location.county(),
  city: faker.location.city(),
  state: faker.location.state({ abbreviated: true })
}));
