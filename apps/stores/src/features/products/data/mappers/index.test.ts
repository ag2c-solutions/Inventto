import { describe, expect, it } from 'vitest';

import {
  categoryDTOFactory,
  createProductFactory,
  createProductWithVariantsFactory,
  productAttributeDTOFactory,
  productDTOFactory,
  productImageDTOFactory,
  productVariantDTOFactory,
  productVariantImageDTOFactory,
  updateProductFactory
} from '../../tests/factories/product.factory';

import { ProductMapper } from '.';

describe('ProductMapper', () => {
  describe('toDomainAttribute', () => {
    it('should map an attribute DTO renaming label to name', () => {
      const dto = productAttributeDTOFactory.build({ label: 'Tamanho' });

      const result = ProductMapper.toDomainAttribute(dto);

      expect(result).toEqual({
        id: dto.id,
        name: 'Tamanho',
        slug: dto.slug,
        type: dto.type,
        values: dto.values
      });
    });
  });

  describe('toDomainAttributeList', () => {
    it('should map a list of attributes filtering out null entries', () => {
      const dto = productAttributeDTOFactory.build();

      const result = ProductMapper.toDomainAttributeList([dto, null as never]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(dto.id);
    });

    it('should return an empty array when attributes is undefined', () => {
      expect(ProductMapper.toDomainAttributeList(undefined)).toEqual([]);
    });
  });

  describe('toDomain', () => {
    it('should map a simple product without variants correctly', () => {
      const dto = productDTOFactory.build({
        has_variants: false,
        categories: [
          categoryDTOFactory.build({
            category: { id: 'cat-1', name: 'Roupas' }
          })
        ],
        product_attributes: [],
        product_images: [productImageDTOFactory.build({ is_primary: true })]
      });

      const result = ProductMapper.toDomain(dto);

      expect(result.hasVariants).toBe(false);
      expect(result.categories[0]).toEqual({ id: 'cat-1', name: 'Roupas' });
      expect(result.allImages).toHaveLength(1);
      expect(result.allImages?.[0].isPrimary).toBe(true);
      expect(result.attributes).toEqual([]);
    });

    it('should map a product with variants correctly', () => {
      const dto = productDTOFactory.build({
        has_variants: true,
        product_attributes: [
          productAttributeDTOFactory.build({
            label: 'Tamanho',
            slug: 'tamanho',
            type: 'text',
            values: ['38', '39', '40']
          })
        ],
        product_variants: [
          productVariantDTOFactory.build({
            sku: 'SNEAKER-38',
            product_variant_images: [
              productVariantImageDTOFactory.build({
                image_id: 'img-var-1',
                is_primary: true
              }),
              productVariantImageDTOFactory.build({
                image_id: 'img-var-2',
                is_primary: false
              })
            ]
          })
        ]
      });

      const result = ProductMapper.toDomain(dto);

      expect(result.hasVariants).toBe(true);
      if (result.hasVariants) {
        expect(result.variants).toHaveLength(1);
        expect(result.variants[0].sku).toBe('SNEAKER-38');
        expect(result.variants[0].images[0].isPrimary).toBe(true);
      }
    });

    it('should map variants without cost_price (payload da RPC sanitizada — PROD-10) to undefined costPrice', () => {
      const dto = productDTOFactory.build({
        has_variants: true,
        cost_price: undefined,
        product_variants: [
          productVariantDTOFactory.build({ cost_price: undefined })
        ]
      });

      const result = ProductMapper.toDomain(dto);

      expect(result.costPrice).toBeUndefined();
      if (result.hasVariants) {
        expect(result.variants[0].costPrice).toBeUndefined();
      }
    });

    it('should return empty categories when categories is null', () => {
      const dto = productDTOFactory.build({
        categories: null as never
      });

      const result = ProductMapper.toDomain(dto);
      expect(result.categories).toEqual([]);
    });

    it('should filter out null attributes', () => {
      const dto = productDTOFactory.build({
        product_attributes: [productAttributeDTOFactory.build(), null as never]
      });

      const result = ProductMapper.toDomain(dto);
      expect(result.attributes).toHaveLength(1);
    });

    it('should handle undefined lists gracefully', () => {
      const dto = productDTOFactory.build({
        product_attributes: undefined as never,
        product_images: undefined as never,
        product_variants: undefined as never
      });

      const result = ProductMapper.toDomain(dto);

      expect(result.attributes).toEqual([]);
      expect(result.allImages).toEqual([]);
    });

    it('should sort variant images putting primary first', () => {
      const dto = productDTOFactory.build({
        has_variants: true,
        product_variants: [
          productVariantDTOFactory.build({
            product_variant_images: [
              productVariantImageDTOFactory.build({
                image_id: '1',
                is_primary: false
              }),
              productVariantImageDTOFactory.build({
                image_id: '2',
                is_primary: true
              }),
              productVariantImageDTOFactory.build({
                image_id: '3',
                is_primary: false
              })
            ]
          })
        ]
      });

      const result = ProductMapper.toDomain(dto);
      if (result.hasVariants) {
        expect(result.variants[0].images[0].id).toBe('2');
      }
    });

    it('should fallback optional fields to undefined when absent', () => {
      const dto = productDTOFactory.build({
        description: null,
        cost_price: undefined
      });

      const result = ProductMapper.toDomain(dto);

      expect(result.description).toBeUndefined();
      expect(result.costPrice).toBeUndefined();
    });
  });

  describe('toPersistence', () => {
    it('should map a simple product without variants and without id (create)', () => {
      const product = createProductFactory.build();

      const result = ProductMapper.toPersistence(product);

      expect(result.id).toBeUndefined();
      expect(result.organization_id).toBe(product.organizationId);
      expect(result.hasVariants).toBe(false);
      expect(result.attributes).toEqual([]);
      expect(result.variants).toEqual([]);
      expect(result.category_ids).toEqual(
        product.categories.map((category) => category.id)
      );
    });

    it('should map a product with variants and attributes', () => {
      const product = createProductWithVariantsFactory.build();

      const result = ProductMapper.toPersistence(product);

      expect(result.hasVariants).toBe(true);
      expect(result.attributes).toHaveLength(product.attributes.length);
      expect(result.variants).toHaveLength(product.variants.length);
      expect(result.variants[0]).toMatchObject({
        sku: product.variants[0].sku,
        stock: product.variants[0].stock
      });
    });

    it('should include the id when mapping an update payload', () => {
      const product = updateProductFactory.build({ id: 'prod-99' });

      const result = ProductMapper.toPersistence(product);

      expect(result.id).toBe('prod-99');
    });

    it('should fallback isPrimary to false when variant image has none', () => {
      const product = createProductWithVariantsFactory.build({
        variants: [
          {
            sku: 'SKU-1',
            stock: 1,
            minimumStock: 0,
            isActive: true,
            images: [{ id: 'img-1', isPrimary: undefined }],
            options: [{ name: 'Cor', value: 'Azul' }]
          }
        ]
      });

      const result = ProductMapper.toPersistence(product);

      expect(result.variants[0].images[0].isPrimary).toBe(false);
    });
  });
});
