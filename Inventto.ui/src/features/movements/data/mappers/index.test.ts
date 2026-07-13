import { describe, expect, it } from 'vitest';

import {
  createMovementInputFactory,
  createMovementItemInputFactory,
  movementDTOFactory,
  movementItemDTOFactory
} from '../../tests/factories/movement.factory';

import { MovementMapper } from './index';

describe('MovementMapper', () => {
  describe('toDomain', () => {
    it('should map scalar fields correctly', () => {
      const dto = movementDTOFactory.build({
        reason: 'purchase',
        document_number: 'DOC-001',
        profiles: { full_name: 'John Doe', avatar_url: 'avatar.jpg' }
      });

      const result = MovementMapper.toDomain(dto);

      expect(result.id).toBe(dto.id);
      expect(result.organizationId).toBe(dto.organization_id);
      expect(result.type).toBe(dto.type);
      expect(result.reason).toBe('Compra');
      expect(result.documentNumber).toBe('DOC-001');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.executedAt).toEqual(new Date(dto.executed_at));
      expect(result.user?.fullName).toBe('John Doe');
      expect(result.user?.avatarUrl).toBe('avatar.jpg');
    });

    it('should compute totalQuantity and totalValue from items', () => {
      const dto = movementDTOFactory.build({
        movement_items: [
          movementItemDTOFactory.build({ quantity: 5, unit_cost: 10 }),
          movementItemDTOFactory.build({ quantity: 3, unit_cost: 15 })
        ]
      });

      const result = MovementMapper.toDomain(dto);

      expect(result.totalQuantity).toBe(8); // 5 + 3
      expect(result.totalValue).toBe(95); // 5*10 + 3*15
    });

    it('should use variant image url when available (primary)', () => {
      const dto = movementDTOFactory.build({
        movement_items: [
          movementItemDTOFactory.build({
            variant_id: 'var-1',
            products: { name: 'T-Shirt', product_images: [] },
            product_variants: {
              sku: 'SKU-001',
              options: [{ name: 'Color', value: 'Blue' }],
              product_variant_images: [
                {
                  is_primary: true,
                  product_images: { url: 'variant-blue.jpg' }
                }
              ]
            }
          })
        ]
      });

      const result = MovementMapper.toDomain(dto);

      expect(result.items[0].product.imageUrl).toBe('variant-blue.jpg');
      expect(result.items[0].product.variantOptions).toBe('Color: Blue');
      expect(result.items[0].product.sku).toBe('SKU-001');
    });

    it('should fallback to product primary image when no variant image', () => {
      const dto = movementDTOFactory.build({
        movement_items: [
          movementItemDTOFactory.build({
            variant_id: null,
            product_variants: null,
            products: {
              name: 'Cap',
              product_images: [
                { url: 'cap-back.jpg', is_primary: false },
                { url: 'cap-front.jpg', is_primary: true }
              ]
            }
          })
        ]
      });

      const result = MovementMapper.toDomain(dto);

      expect(result.items[0].product.imageUrl).toBe('cap-front.jpg');
    });

    it('should set user to undefined when profiles is null', () => {
      const dto = movementDTOFactory.build({ profiles: null });

      const result = MovementMapper.toDomain(dto);

      expect(result.user).toBeUndefined();
    });

    it('should use "Sistema" as fullName when profiles.full_name is null', () => {
      const dto = movementDTOFactory.build({
        profiles: { full_name: null, avatar_url: null }
      });

      const result = MovementMapper.toDomain(dto);

      expect(result.user?.fullName).toBe('Sistema');
    });

    it('should map the linked order status when present', () => {
      const dto = movementDTOFactory.build({
        order_id: 'order-1',
        orders: { status: 'confirmed' }
      });

      const result = MovementMapper.toDomain(dto);

      expect(result.orderId).toBe('order-1');
      expect(result.orderStatus).toBe('confirmed');
    });

    it('should leave orderStatus undefined when there is no linked order', () => {
      const dto = movementDTOFactory.build({ order_id: null, orders: null });

      const result = MovementMapper.toDomain(dto);

      expect(result.orderStatus).toBeUndefined();
    });
  });

  describe('toPersistence', () => {
    it('should map CreateMovementInput to CreateStockMovementRPCDTO correctly', () => {
      const input = createMovementInputFactory.build({
        type: 'entry',
        reason: 'Ajuste de inventário (+)',
        documentNumber: 'DOC-123',
        items: [
          createMovementItemInputFactory.build({
            productId: 'prod-1',
            variantId: 'var-1',
            quantity: 5,
            unitCost: 10,
            unitPrice: 20
          })
        ]
      });

      const result = MovementMapper.toPersistence(input, 'org-1');

      expect(result.organization_id).toBe('org-1');
      expect(result.type).toBe('entry');
      expect(result.reason).toBe('adjustment_in');
      expect(result.document_number).toBe('DOC-123');
      expect(result.executed_at).toBe(input.executedAt.toISOString());
      expect(result.items[0].product_id).toBe('prod-1');
      expect(result.items[0].variant_id).toBe('var-1');
      expect(result.items[0].quantity).toBe(5);
    });

    it('should set document_number to null when not provided', () => {
      const input = createMovementInputFactory.build({
        reason: 'Outro',
        documentNumber: undefined,
        items: []
      });

      const result = MovementMapper.toPersistence(input, 'org-1');

      expect(result.document_number).toBeNull();
    });
  });
});
