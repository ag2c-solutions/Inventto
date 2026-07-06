import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { CatalogDTO, CatalogThemeConfigDTO } from '../../data/dtos';
import type {
  Catalog,
  CatalogThemeConfig,
  CreateCatalogPayload
} from '../../domain/entities';

export const catalogThemeConfigFactory = Factory.define<CatalogThemeConfig>(
  () => ({
    colors: {
      primary: faker.color.rgb(),
      background: faker.color.rgb(),
      text: faker.color.rgb()
    },
    branding: { showCover: false },
    layout: { mode: 'grid', productsPerPage: 10 },
    behavior: { displayPrice: true, whatsappMessage: 'Olá' }
  })
);

export const catalogThemeConfigDTOFactory =
  Factory.define<CatalogThemeConfigDTO>(() => ({
    colors: {
      primary: faker.color.rgb(),
      background: faker.color.rgb(),
      text: faker.color.rgb()
    },
    branding: { show_cover: false },
    layout: { mode: 'grid', products_per_page: 10 },
    behavior: { display_price: true, whatsapp_message: 'Olá' }
  }));

export const catalogFactory = Factory.define<Catalog>(() => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  slug: faker.helpers.slugify(faker.commerce.productName()).toLowerCase(),
  whatsappNumber: faker.string.numeric(13),
  description: faker.lorem.sentence(),
  isActive: true,
  themeConfig: catalogThemeConfigFactory.build(),
  createdAt: faker.date.recent()
}));

export const catalogDTOFactory = Factory.define<CatalogDTO>(() => ({
  id: faker.string.uuid(),
  organization_id: faker.string.uuid(),
  name: faker.commerce.productName(),
  slug: faker.helpers.slugify(faker.commerce.productName()).toLowerCase(),
  whatsapp_number: faker.string.numeric(13),
  description: faker.lorem.sentence(),
  is_active: true,
  theme_config: catalogThemeConfigDTOFactory.build(),
  created_at: faker.date.past().toISOString(),
  updated_at: faker.date.recent().toISOString()
}));

export const createCatalogPayloadFactory = Factory.define<CreateCatalogPayload>(
  () => ({
    organizationId: faker.string.uuid(),
    name: faker.commerce.productName(),
    slug: faker.helpers.slugify(faker.commerce.productName()).toLowerCase(),
    whatsappNumber: faker.string.numeric(13),
    themeConfig: catalogThemeConfigFactory.build()
  })
);
