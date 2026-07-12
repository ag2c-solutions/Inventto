import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { StorefrontDTO } from '../../data/dtos';
import type { Storefront } from '../../domain/entities';

export const storefrontFactory = Factory.define<Storefront>(() => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
  catalogId: faker.string.uuid(),
  catalogName: faker.commerce.productName(),
  whatsapp: faker.phone.number(),
  instagram: `@${faker.internet.username()}`,
  facebook: `/${faker.internet.username()}`,
  website: faker.internet.url(),
  state: 'live',
  publicUrl: `inventto.app/${faker.helpers.slugify(faker.company.name()).toLowerCase()}`
}));

export const storefrontDTOFactory = Factory.define<StorefrontDTO>(() => ({
  id: faker.string.uuid(),
  organization_id: faker.string.uuid(),
  name: faker.company.name(),
  slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
  catalog_id: faker.string.uuid(),
  whatsapp: faker.phone.number(),
  instagram: `@${faker.internet.username()}`,
  facebook: `/${faker.internet.username()}`,
  website: faker.internet.url(),
  status: 'active',
  catalog: { id: faker.string.uuid(), name: faker.commerce.productName() }
}));
