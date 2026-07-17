import { describe, expect, it } from 'vitest';

import { orderDTOFactory } from '../../tests/factories/order.factory';

import { OrderMapper } from './index';

describe('OrderMapper', () => {
  describe('toDomain', () => {
    it.each([
      ['pending', 'pool'],
      ['confirming', 'attending'],
      ['picking', 'attending'],
      ['delivering', 'attending'],
      ['confirmed', 'done'],
      ['cancelled', 'cancelled'],
      ['expired', 'cancelled']
    ] as const)(
      'should map status="%s" to macroState="%s"',
      (status, macro) => {
        const dto = orderDTOFactory.build({ status });

        const result = OrderMapper.toDomain(dto);

        expect(result.macroState).toBe(macro);
        expect(result.microState).toBe(status);
      }
    );

    it('should map a jsonb delivery_address to a structured Address', () => {
      const dto = orderDTOFactory.build({
        delivery_address: {
          zip_code: '01001-000',
          street: 'Praça da Sé',
          number: '100',
          neighborhood: 'Sé',
          city: 'São Paulo',
          state: 'SP',
          complement: 'Loja 2'
        }
      });

      const result = OrderMapper.toDomain(dto);

      expect(result.address).toEqual({
        zipCode: '01001-000',
        street: 'Praça da Sé',
        number: '100',
        neighborhood: 'Sé',
        city: 'São Paulo',
        state: 'SP',
        complement: 'Loja 2'
      });
    });

    it('should leave address undefined when delivery_address is null', () => {
      const dto = orderDTOFactory.build({ delivery_address: null });

      const result = OrderMapper.toDomain(dto);

      expect(result.address).toBeUndefined();
    });

    it('should map order_items snapshots into domain items', () => {
      const dto = orderDTOFactory.build({
        order_items: [
          {
            id: 'oi-1',
            product_id: 'p-1',
            variant_id: null,
            quantity: 2,
            unit_price: 50,
            product_name_snapshot: 'Vestido Linho'
          }
        ]
      });

      const result = OrderMapper.toDomain(dto);

      expect(result.items).toEqual([
        {
          productId: 'p-1',
          variantId: undefined,
          name: 'Vestido Linho',
          quantity: 2,
          unitPrice: 50
        }
      ]);
    });

    it('should map the linked seller name when present', () => {
      const dto = orderDTOFactory.build({
        seller_id: 'seller-1',
        seller: { id: 'seller-1', full_name: 'Joana Ateliê' }
      });

      const result = OrderMapper.toDomain(dto);

      expect(result.sellerId).toBe('seller-1');
      expect(result.sellerName).toBe('Joana Ateliê');
    });

    it('should leave sellerId/sellerName undefined for pool orders', () => {
      const dto = orderDTOFactory.build({ seller_id: null, seller: null });

      const result = OrderMapper.toDomain(dto);

      expect(result.sellerId).toBeUndefined();
      expect(result.sellerName).toBeUndefined();
    });

    it('should map the linked catalog name to catalogName (RN083 · Origem)', () => {
      const dto = orderDTOFactory.build({
        catalog: { name: 'Coleção Inverno' }
      });

      const result = OrderMapper.toDomain(dto);

      expect(result.catalogName).toBe('Coleção Inverno');
    });

    it('should leave catalogName undefined when there is no linked catalog', () => {
      const dto = orderDTOFactory.build({ catalog: null });

      const result = OrderMapper.toDomain(dto);

      expect(result.catalogName).toBeUndefined();
    });

    it('should derive a short code from the order id', () => {
      const dto = orderDTOFactory.build({ id: 'abcdef12-3456-7890' });

      const result = OrderMapper.toDomain(dto);

      expect(result.code).toBe('ABCDEF12');
    });

    it('should map timestamps to Date instances', () => {
      const dto = orderDTOFactory.build({
        created_at: '2026-07-10T10:00:00Z',
        updated_at: '2026-07-11T12:00:00Z',
        claimed_at: '2026-07-10T10:05:00Z',
        finalized_at: null,
        expires_at: null
      });

      const result = OrderMapper.toDomain(dto);

      expect(result.receivedAt).toEqual(new Date('2026-07-10T10:00:00Z'));
      expect(result.lastActionAt).toEqual(new Date('2026-07-11T12:00:00Z'));
      expect(result.claimedAt).toEqual(new Date('2026-07-10T10:05:00Z'));
      expect(result.finalizedAt).toBeUndefined();
      expect(result.expiresAt).toBeUndefined();
    });
  });
});
