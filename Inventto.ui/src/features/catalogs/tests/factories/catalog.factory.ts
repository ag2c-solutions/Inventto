import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { CatalogDTO } from '../../data/dtos';
import type { Catalog, CreateCatalogPayload } from '../../domain/entities';

export const catalogFactory = Factory.define<Catalog>(() => ({
  id: faker.string.uuid(),
  organizationId: faker.string.uuid(),
  name: faker.commerce.productName(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  productsCount: faker.number.int({ min: 0, max: 20 }),
  channelsCount: 0
}));

export const catalogDTOFactory = Factory.define<CatalogDTO>(() => ({
  id: faker.string.uuid(),
  organization_id: faker.string.uuid(),
  name: faker.commerce.productName(),
  created_at: faker.date.past().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  catalog_items: [{ count: faker.number.int({ min: 0, max: 20 }) }]
}));

export const createCatalogPayloadFactory = Factory.define<CreateCatalogPayload>(
  () => ({
    organizationId: faker.string.uuid(),
    name: faker.commerce.productName()
  })
);
