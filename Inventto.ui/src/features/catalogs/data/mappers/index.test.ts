import { describe, expect, it } from 'vitest';

import { catalogDTOFactory } from '../../tests/factories/catalog.factory';
import { catalogItemDTOFactory } from '../../tests/factories/catalog-item.factory';

import { CatalogItemMapper, CatalogMapper } from './index';

describe('CatalogMapper', () => {
  describe('toDomain', () => {
    it('should map a DTO to the channel-agnostic domain model', () => {
      const dto = catalogDTOFactory.build({
        catalog_items: [{ count: 5 }]
      });

      const result = CatalogMapper.toDomain(dto);

      expect(result).toEqual({
        id: dto.id,
        organizationId: dto.organization_id,
        name: dto.name,
        createdAt: new Date(dto.created_at),
        updatedAt: new Date(dto.updated_at),
        productsCount: 5,
        channelsCount: 0
      });
    });

    it('should default productsCount to 0 when catalog_items is empty', () => {
      const dto = catalogDTOFactory.build({ catalog_items: [] });

      const result = CatalogMapper.toDomain(dto);

      expect(result.productsCount).toBe(0);
    });
  });

  describe('toPersistence', () => {
    it('should convert camelCase payload to snake_case DTO', () => {
      const result = CatalogMapper.toPersistence({
        organizationId: 'org-1',
        name: 'Catálogo Verão'
      });

      expect(result).toEqual({
        organization_id: 'org-1',
        name: 'Catálogo Verão'
      });
    });

    it('should omit fields that are not provided', () => {
      const result = CatalogMapper.toPersistence({ name: 'Só nome' });

      expect(result.name).toBe('Só nome');
      expect(result.organization_id).toBeUndefined();
    });
  });
});

describe('CatalogItemMapper', () => {
  describe('toDomain', () => {
    it('should convert price and original_price from reais (DB) to cents (domain)', () => {
      const dto = catalogItemDTOFactory.build({
        price: 89.9,
        original_price: 129.9
      });

      const result = CatalogItemMapper.toDomain(dto);

      expect(result).toEqual({
        id: dto.id,
        catalogId: dto.catalog_id,
        productId: dto.product_id,
        variantId: undefined,
        price: 8990,
        originalPrice: 12990,
        product: {
          id: dto.product.id,
          name: dto.product.name,
          sku: dto.product.sku,
          imageUrl: dto.product.product_images[0].url
        },
        variant: undefined
      });
      expect(result).not.toHaveProperty('isFeatured');
    });

    it('should default originalPrice to undefined when absent', () => {
      const dto = catalogItemDTOFactory.build({ original_price: null });

      const result = CatalogItemMapper.toDomain(dto);

      expect(result.originalPrice).toBeUndefined();
    });

    it('should default variantId to undefined when absent', () => {
      const dto = catalogItemDTOFactory.build({ variant_id: null });

      const result = CatalogItemMapper.toDomain(dto);

      expect(result.variantId).toBeUndefined();
    });

    it('should map the variant when present', () => {
      const dto = catalogItemDTOFactory.build({
        variant_id: 'v1',
        variant: {
          id: 'v1',
          sku: 'SKU-V1',
          options: [{ name: 'Cor', value: 'Azul' }]
        }
      });

      const result = CatalogItemMapper.toDomain(dto);

      expect(result.variant).toEqual({
        id: 'v1',
        sku: 'SKU-V1',
        options: [{ name: 'Cor', value: 'Azul' }]
      });
    });

    it('should prefer the primary image when multiple images exist', () => {
      const dto = catalogItemDTOFactory.build({
        product: {
          id: 'p1',
          name: 'Produto',
          sku: 'SKU-1',
          product_images: [
            { url: 'secondary.jpg', is_primary: false },
            { url: 'primary.jpg', is_primary: true }
          ]
        }
      });

      const result = CatalogItemMapper.toDomain(dto);

      expect(result.product.imageUrl).toBe('primary.jpg');
    });

    it('should leave imageUrl undefined when the product has no images', () => {
      const dto = catalogItemDTOFactory.build({
        product: {
          id: 'p1',
          name: 'Produto',
          sku: 'SKU-1',
          product_images: []
        }
      });

      const result = CatalogItemMapper.toDomain(dto);

      expect(result.product.imageUrl).toBeUndefined();
    });
  });
});
