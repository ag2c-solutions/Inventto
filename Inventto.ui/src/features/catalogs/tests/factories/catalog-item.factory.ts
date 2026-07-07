import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { CatalogItemDTO } from '../../data/dtos';
import type { CatalogItem } from '../../domain/entities';

export const catalogItemFactory = Factory.define<CatalogItem>(() => ({
  id: faker.string.uuid(),
  catalogId: faker.string.uuid(),
  productId: faker.string.uuid(),
  price: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
  originalPrice: undefined,
  product: {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    sku: faker.string.alphanumeric(8).toUpperCase(),
    imageUrl: faker.image.url()
  }
}));

export const catalogItemDTOFactory = Factory.define<CatalogItemDTO>(() => ({
  id: faker.string.uuid(),
  catalog_id: faker.string.uuid(),
  product_id: faker.string.uuid(),
  variant_id: null,
  price: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
  original_price: null,
  product: {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    sku: faker.string.alphanumeric(8).toUpperCase(),
    product_images: [{ url: faker.image.url(), is_primary: true }]
  }
}));
