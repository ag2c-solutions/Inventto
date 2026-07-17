import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { PdvCatalogItemDTO } from '../../data/dtos';
import type { PdvProduct } from '../../domain/entities';

export const pdvProductFactory = Factory.define<PdvProduct>(() => ({
  productId: faker.string.uuid(),
  name: faker.commerce.productName(),
  sku: faker.string.alphanumeric(8).toUpperCase(),
  price: faker.number.int({ min: 1000, max: 50000 }),
  stock: faker.number.int({ min: 1, max: 50 }),
  isOut: false,
  imageUrl: faker.image.url()
}));

export const pdvCatalogItemDTOFactory = Factory.define<PdvCatalogItemDTO>(
  () => ({
    id: faker.string.uuid(),
    product_id: faker.string.uuid(),
    variant_id: null,
    price: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
    product: {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      sku: faker.string.alphanumeric(8).toUpperCase(),
      stock: faker.number.int({ min: 1, max: 50 }),
      product_images: [{ url: faker.image.url(), is_primary: true }],
      categories: []
    },
    variant: null
  })
);
