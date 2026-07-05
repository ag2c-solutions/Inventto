import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { CategoryDTO } from '../../data/dtos';
import type { Category, CreateCategoryPayload } from '../../domain/entities';

export const categoryFactory = Factory.define<Category>(() => ({
  id: faker.string.uuid(),
  name: faker.commerce.department()
}));

export const categoryDTOFactory = Factory.define<CategoryDTO>(() => ({
  id: faker.string.uuid(),
  name: faker.commerce.department(),
  organization_id: faker.string.uuid()
}));

export const createCategoryPayloadFactory =
  Factory.define<CreateCategoryPayload>(() => ({
    name: faker.commerce.department(),
    organizationId: faker.string.uuid()
  }));
