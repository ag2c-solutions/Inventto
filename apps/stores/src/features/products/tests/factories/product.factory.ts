import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type {
  CategoryDTO,
  ProductAttributeDTO,
  ProductDTO,
  ProductImageDTO,
  ProductVariantDTO,
  ProductVariantImageDTO,
  ProductVariantOptionDTO
} from '../../data/dtos';
import type {
  CreateProduct,
  IProduct,
  IProductAttribute,
  IProductImage,
  IProductVariant,
  IvariantImage,
  UpdateProduct,
  VariantOption
} from '../../domain/entities';

export const variantOptionFactory = Factory.define<VariantOption>(() => ({
  name: 'Cor',
  value: faker.color.human()
}));

export const variantImageRefFactory = Factory.define<IvariantImage>(() => ({
  id: faker.string.uuid(),
  isPrimary: false
}));

export const categoryFactory = Factory.define<{ id: string; name: string }>(
  () => ({
    id: faker.string.uuid(),
    name: faker.commerce.department()
  })
);

export const productImageFactory = Factory.define<IProductImage>(() => ({
  id: faker.string.uuid(),
  url: faker.image.url(),
  name: faker.system.fileName(),
  type: 'image',
  publicId: faker.string.alphanumeric(12),
  isPrimary: false
}));

export const productAttributeFactory = Factory.define<IProductAttribute>(
  () => ({
    id: faker.string.uuid(),
    name: faker.commerce.productAdjective(),
    slug: faker.helpers
      .slugify(faker.commerce.productAdjective())
      .toLowerCase(),
    type: 'select',
    values: [faker.color.human(), faker.color.human()]
  })
);

export const productVariantFactory = Factory.define<IProductVariant>(() => ({
  id: faker.string.uuid(),
  sku: faker.string.alphanumeric(8).toUpperCase(),
  stock: faker.number.int({ min: 0, max: 100 }),
  minimumStock: faker.number.int({ min: 0, max: 10 }),
  costPrice: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
  isActive: true,
  options: [variantOptionFactory.build()],
  images: []
}));

export const productFactory = Factory.define<IProduct>(() => ({
  id: faker.string.uuid(),
  organizationId: faker.string.uuid(),
  name: faker.commerce.productName(),
  sku: faker.string.alphanumeric(8).toUpperCase(),
  description: faker.commerce.productDescription(),
  isActive: true,
  costPrice: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
  stock: faker.number.int({ min: 0, max: 100 }),
  minimumStock: faker.number.int({ min: 0, max: 10 }),
  categories: [categoryFactory.build()],
  allImages: [productImageFactory.build({ isPrimary: true })],
  attributes: [],
  createdAt: faker.date.past().toISOString(),
  hasVariants: false,
  variants: []
}));

export const productWithVariantsFactory = Factory.define<IProduct>(() => ({
  ...productFactory.build(),
  attributes: [productAttributeFactory.build()],
  hasVariants: true,
  variants: productVariantFactory.buildList(2)
}));

export const createProductFactory = Factory.define<CreateProduct>(() => ({
  organizationId: faker.string.uuid(),
  name: faker.commerce.productName(),
  sku: faker.string.alphanumeric(8).toUpperCase(),
  description: faker.commerce.productDescription(),
  categories: [categoryFactory.build()],
  stock: faker.number.int({ min: 0, max: 100 }),
  minimumStock: faker.number.int({ min: 0, max: 10 }),
  isActive: true,
  attributes: [],
  allImages: [productImageFactory.build({ isPrimary: true })],
  hasVariants: false,
  variants: []
}));

export const createProductWithVariantsFactory = Factory.define<CreateProduct>(
  () => ({
    ...createProductFactory.build(),
    attributes: [productAttributeFactory.build()],
    hasVariants: true,
    variants: [
      {
        sku: faker.string.alphanumeric(8).toUpperCase(),
        stock: faker.number.int({ min: 0, max: 100 }),
        minimumStock: faker.number.int({ min: 0, max: 10 }),
        isActive: true,
        images: [],
        options: [variantOptionFactory.build()]
      }
    ]
  })
);

export const updateProductFactory = Factory.define<UpdateProduct>(() => ({
  id: faker.string.uuid(),
  organizationId: faker.string.uuid(),
  name: faker.commerce.productName(),
  sku: faker.string.alphanumeric(8).toUpperCase(),
  description: faker.commerce.productDescription(),
  categories: [categoryFactory.build()],
  stock: faker.number.int({ min: 0, max: 100 }),
  minimumStock: faker.number.int({ min: 0, max: 10 }),
  isActive: true,
  attributes: [],
  allImages: [productImageFactory.build({ isPrimary: true })],
  hasVariants: false,
  variants: []
}));

export const categoryDTOFactory = Factory.define<CategoryDTO>(() => ({
  category: {
    id: faker.string.uuid(),
    name: faker.commerce.department()
  }
}));

export const productImageDTOFactory = Factory.define<ProductImageDTO>(() => ({
  id: faker.string.uuid(),
  url: faker.image.url(),
  name: faker.system.fileName(),
  type: 'image',
  public_id: faker.string.alphanumeric(12),
  is_primary: false
}));

export const productAttributeDTOFactory = Factory.define<ProductAttributeDTO>(
  () => ({
    id: faker.string.uuid(),
    label: faker.commerce.productAdjective(),
    slug: faker.helpers
      .slugify(faker.commerce.productAdjective())
      .toLowerCase(),
    type: 'select',
    values: [faker.color.human(), faker.color.human()]
  })
);

export const productVariantOptionDTOFactory =
  Factory.define<ProductVariantOptionDTO>(() => ({
    name: 'Cor',
    value: faker.color.human()
  }));

export const productVariantImageDTOFactory =
  Factory.define<ProductVariantImageDTO>(() => ({
    image_id: faker.string.uuid(),
    is_primary: false
  }));

export const productVariantDTOFactory = Factory.define<ProductVariantDTO>(
  () => ({
    id: faker.string.uuid(),
    sku: faker.string.alphanumeric(8).toUpperCase(),
    stock: faker.number.int({ min: 0, max: 100 }),
    minimum_stock: faker.number.int({ min: 0, max: 10 }),
    cost_price: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
    is_active: true,
    options: [productVariantOptionDTOFactory.build()],
    product_variant_images: []
  })
);

export const productDTOFactory = Factory.define<ProductDTO>(() => ({
  id: faker.string.uuid(),
  organization_id: faker.string.uuid(),
  name: faker.commerce.productName(),
  sku: faker.string.alphanumeric(8).toUpperCase(),
  description: faker.commerce.productDescription(),
  stock: faker.number.int({ min: 0, max: 100 }),
  minimum_stock: faker.number.int({ min: 0, max: 10 }),
  cost_price: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
  has_variants: false,
  is_active: true,
  created_at: faker.date.past().toISOString(),
  categories: [categoryDTOFactory.build()],
  product_attributes: [],
  product_images: [productImageDTOFactory.build({ is_primary: true })],
  product_variants: []
}));
