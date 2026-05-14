import { describe, expect, it } from 'vitest';

import type { ProductDTO } from '../dtos';

import { ProductMapper } from '.';

describe('ProductMapper', () => {
  describe('toDomain', () => {
    it('should map a simple product without variants correctly', () => {
      const dto = {
        id: 'prod-1',
        organization_id: 'org-1',
        name: 'Camiseta Básica',
        sku: 'TSHIRT-001',
        description: 'Uma camiseta legal',
        stock: 100,
        minimum_stock: 10,
        has_variants: false,
        is_active: true,
        created_at: '2024-01-01',
        categories: [{ category: { id: 'cat-1', name: 'Roupas' } }],
        product_attributes: [],
        product_images: [
          {
            id: 'img-1',
            name: 'front.jpg',
            url: 'url-front',
            public_id: 'pid-1',
            type: 'image',
            is_primary: true
          }
        ],
        product_variants: []
      };

      const result = ProductMapper.toDomain(dto as unknown as ProductDTO);

      expect(result.hasVariants).toBe(false);
      expect(result.categories[0]).toEqual({ id: 'cat-1', name: 'Roupas' });
      expect(result.allImages).toHaveLength(1);
      expect(result.allImages?.[0].isPrimary).toBe(true);
      expect(result.attributes).toEqual([]);
    });

    it('should map a product with variants correctly', () => {
      const dto = {
        id: 'prod-2',
        organization_id: 'org-1',
        name: 'Tênis Sport',
        sku: 'SNEAKER-001',
        stock: 50,
        minimum_stock: 5,
        has_variants: true,
        is_active: true,
        created_at: '2024-01-01',
        categories: [{ category: { id: 'cat-2', name: 'Calçados' } }],
        product_attributes: [
          {
            id: 'attr-1',
            label: 'Tamanho',
            slug: 'tamanho',
            type: 'text',
            values: ['38', '39', '40']
          }
        ],
        product_images: [],
        product_variants: [
          {
            id: 'var-1',
            sku: 'SNEAKER-38',
            stock: 20,
            minimum_stock: 2,
            cost_price: 100,
            is_active: true,
            options: [{ name: 'Tamanho', value: '38' }],
            product_variant_images: [
              { image_id: 'img-var-1', is_primary: true },
              { image_id: 'img-var-2', is_primary: false }
            ]
          }
        ]
      };

      const result = ProductMapper.toDomain(dto as unknown as ProductDTO);

      expect(result.hasVariants).toBe(true);
      if (result.hasVariants) {
        expect(result.variants).toHaveLength(1);
        expect(result.variants[0].sku).toBe('SNEAKER-38');
        expect(result.variants[0].images[0].isPrimary).toBe(true);
      }
    });

    it('should return empty categories when categories is null', () => {
      const dto = {
        id: 'prod-orphan',
        organization_id: 'org-1',
        name: 'Produto Órfão',
        sku: 'ORPHAN',
        stock: 0,
        minimum_stock: 0,
        has_variants: false,
        is_active: true,
        created_at: '2024-01-01',
        categories: null,
        product_attributes: [],
        product_images: [],
        product_variants: []
      };

      const result = ProductMapper.toDomain(dto as unknown as ProductDTO);
      expect(result.categories).toEqual([]);
    });

    it('should handle undefined lists gracefully', () => {
      const dto = {
        id: 'prod-4',
        organization_id: 'org-1',
        name: 'Produto Vazio',
        sku: 'EMPTY',
        stock: 0,
        minimum_stock: 0,
        has_variants: false,
        is_active: true,
        created_at: '2024-01-01',
        categories: [{ category: { id: 'cat-1', name: 'Roupas' } }],
        product_attributes: undefined,
        product_images: undefined,
        product_variants: undefined
      };

      const result = ProductMapper.toDomain(dto as unknown as ProductDTO);

      expect(result.attributes).toEqual([]);
      expect(result.allImages).toEqual([]);
    });

    it('should sort variant images putting primary first', () => {
      const dto = {
        categories: [{ category: { id: 'c', name: 'n' } }],
        has_variants: true,
        product_variants: [
          {
            product_variant_images: [
              { image_id: '1', is_primary: false },
              { image_id: '2', is_primary: true },
              { image_id: '3', is_primary: false }
            ]
          }
        ]
      };

      const result = ProductMapper.toDomain(dto as unknown as ProductDTO);
      if (result.hasVariants) {
        expect(result.variants[0].images[0].id).toBe('2');
      }
    });
  });
});
