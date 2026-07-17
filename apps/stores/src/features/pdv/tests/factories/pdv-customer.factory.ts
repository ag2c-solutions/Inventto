import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { LookupPosCustomerDTO } from '../../data/dtos';
import type { PdvCustomer } from '../../domain/entities';

export const pdvCustomerFactory = Factory.define<PdvCustomer>(() => ({
  customerId: faker.string.uuid(),
  name: faker.person.fullName(),
  since: faker.date.past()
}));

export const lookupPosCustomerDTOFactory = Factory.define<LookupPosCustomerDTO>(
  () => ({
    customer_id: faker.string.uuid(),
    name: faker.person.fullName(),
    since: faker.date.past().toISOString()
  })
);
