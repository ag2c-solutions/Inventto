import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { ImportCandidateDTO, SourceVariantDTO } from '../../data/dtos';
import type {
  ImportCandidate,
  ImportCandidateVariant
} from '../../domain/entities';

import {
  productVariantOptionDTOFactory,
  variantOptionFactory
} from './product.factory';

export const importCandidateFactory = Factory.define<ImportCandidate>(() => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  sku: faker.string.alphanumeric(8).toUpperCase(),
  alreadyImported: false,
  imageUrl: faker.image.url(),
  imagePublicId: faker.string.alphanumeric(12),
  variantCount: 0
}));

export const importCandidateDTOFactory = Factory.define<ImportCandidateDTO>(
  () => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    sku: faker.string.alphanumeric(8).toUpperCase(),
    already_imported: false,
    image_url: faker.image.url(),
    image_public_id: faker.string.alphanumeric(12),
    variant_count: 0
  })
);

export const importCandidateVariantFactory =
  Factory.define<ImportCandidateVariant>(() => ({
    id: faker.string.uuid(),
    sku: faker.string.alphanumeric(8).toUpperCase(),
    options: [variantOptionFactory.build()],
    imageUrl: faker.image.url(),
    imagePublicId: faker.string.alphanumeric(12)
  }));

export const sourceVariantDTOFactory = Factory.define<SourceVariantDTO>(() => ({
  id: faker.string.uuid(),
  sku: faker.string.alphanumeric(8).toUpperCase(),
  options: [productVariantOptionDTOFactory.build()],
  image_url: faker.image.url(),
  image_public_id: faker.string.alphanumeric(12)
}));
