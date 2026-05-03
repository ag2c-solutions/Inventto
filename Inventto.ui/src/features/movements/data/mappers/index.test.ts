import { describe, expect, it } from 'vitest';

import type { MovementDTO } from '../dtos';

import { MovementMapper } from './index';

describe('MovementMapper', () => {
  describe('toDomain', () => {
    const baseDTO: MovementDTO = {
      id: 'mov-1',
      organization_id: 'org-1',
      user_id: 'user-1',
      type: 'entry',
      reason: 'Restock',
      document_number: 'DOC-001',
      order_id: null,
      created_at: '2023-10-01T10:00:00Z',
      profiles: { full_name: 'John Doe', avatar_url: 'avatar.jpg' },
      movement_items: []
    };

    it('should map scalar fields correctly', () => {
      const result = MovementMapper.toDomain(baseDTO);

      expect(result.id).toBe('mov-1');
      expect(result.organizationId).toBe('org-1');
      expect(result.type).toBe('entry');
      expect(result.reason).toBe('Restock');
      expect(result.documentNumber).toBe('DOC-001');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.user?.fullName).toBe('John Doe');
      expect(result.user?.avatarUrl).toBe('avatar.jpg');
    });

    it('should compute totalQuantity and totalValue from items', () => {
      const dto: MovementDTO = {
        ...baseDTO,
        movement_items: [
          {
            id: 'item-1',
            movement_id: 'mov-1',
            product_id: 'prod-1',
            variant_id: null,
            quantity: 5,
            unit_cost: 10,
            unit_price: 20,
            products: { name: 'Product A', product_images: [] }
          },
          {
            id: 'item-2',
            movement_id: 'mov-1',
            product_id: 'prod-2',
            variant_id: null,
            quantity: 3,
            unit_cost: 15,
            unit_price: 30,
            products: { name: 'Product B', product_images: [] }
          }
        ]
      };

      const result = MovementMapper.toDomain(dto);

      expect(result.totalQuantity).toBe(8); // 5 + 3
      expect(result.totalValue).toBe(95); // 5*10 + 3*15
    });

    it('should use variant image url when available (primary)', () => {
      const dto: MovementDTO = {
        ...baseDTO,
        movement_items: [
          {
            id: 'item-1',
            movement_id: 'mov-1',
            product_id: 'prod-1',
            variant_id: 'var-1',
            quantity: 1,
            unit_cost: 10,
            unit_price: 20,
            products: { name: 'T-Shirt', product_images: [] },
            product_variants: {
              sku: 'SKU-001',
              options: { Color: 'Blue' },
              product_variant_images: [
                {
                  is_primary: true,
                  product_images: { url: 'variant-blue.jpg' }
                }
              ]
            }
          }
        ]
      };

      const result = MovementMapper.toDomain(dto);

      expect(result.items[0].product.imageUrl).toBe('variant-blue.jpg');
      expect(result.items[0].product.variantOptions).toBe('Color: Blue');
      expect(result.items[0].product.sku).toBe('SKU-001');
    });

    it('should fallback to product primary image when no variant image', () => {
      const dto: MovementDTO = {
        ...baseDTO,
        movement_items: [
          {
            id: 'item-1',
            movement_id: 'mov-1',
            product_id: 'prod-1',
            variant_id: null,
            quantity: 1,
            unit_cost: 10,
            unit_price: 20,
            products: {
              name: 'Cap',
              product_images: [
                { url: 'cap-back.jpg', is_primary: false },
                { url: 'cap-front.jpg', is_primary: true }
              ]
            }
          }
        ]
      };

      const result = MovementMapper.toDomain(dto);

      expect(result.items[0].product.imageUrl).toBe('cap-front.jpg');
    });

    it('should set user to undefined when profiles is null', () => {
      const result = MovementMapper.toDomain({ ...baseDTO, profiles: null });

      expect(result.user).toBeUndefined();
    });

    it('should use "Sistema" as fullName when profiles.full_name is null', () => {
      const result = MovementMapper.toDomain({
        ...baseDTO,
        profiles: { full_name: null, avatar_url: null }
      });

      expect(result.user?.fullName).toBe('Sistema');
    });
  });

  describe('toPersistence', () => {
    it('should map CreateMovementInput to CreateStockMovementRPCDTO correctly', () => {
      const result = MovementMapper.toPersistence(
        {
          type: 'adjustment',
          reason: 'Inventory Check',
          documentNumber: 'DOC-123',
          items: [
            {
              productId: 'prod-1',
              variantId: 'var-1',
              quantity: 5,
              unitCost: 10,
              unitPrice: 20
            }
          ]
        },
        'org-1'
      );

      expect(result.organization_id).toBe('org-1');
      expect(result.type).toBe('adjustment');
      expect(result.reason).toBe('Inventory Check');
      expect(result.document_number).toBe('DOC-123');
      expect(result.items[0].product_id).toBe('prod-1');
      expect(result.items[0].variant_id).toBe('var-1');
      expect(result.items[0].quantity).toBe(5);
    });

    it('should set document_number to null when not provided', () => {
      const result = MovementMapper.toPersistence(
        { type: 'entry', reason: 'Test', items: [] },
        'org-1'
      );

      expect(result.document_number).toBeNull();
    });
  });
});
