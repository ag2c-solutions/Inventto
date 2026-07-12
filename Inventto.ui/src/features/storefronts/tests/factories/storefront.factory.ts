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
  publicUrl: `inventto.app/${faker.helpers.slugify(faker.company.name()).toLowerCase()}`,
  theme: {
    colors: {
      primary: '#3A3631',
      background: '#F7F5F2',
      secondary: '#8B857D',
      text: '#2C2A28'
    },
    logoUrl: faker.image.url(),
    coverUrl: faker.image.url(),
    layout: 'grid',
    cardStyle: 'minimal-large-image'
  },
  showPrices: true,
  showSoldOut: true,
  whatsappMessage: 'Olá! Vi sua vitrine e gostaria de fazer um pedido.'
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
  catalog: { id: faker.string.uuid(), name: faker.commerce.productName() },
  theme: {
    colors: {
      primary: '#3A3631',
      background: '#F7F5F2',
      secondary: '#8B857D',
      text: '#2C2A28'
    },
    logo_url: faker.image.url(),
    cover_url: faker.image.url(),
    layout: 'grid',
    card_style: 'minimal-large-image'
  },
  show_prices: true,
  show_sold_out: true,
  whatsapp_message: 'Olá! Vi sua vitrine e gostaria de fazer um pedido.'
}));
