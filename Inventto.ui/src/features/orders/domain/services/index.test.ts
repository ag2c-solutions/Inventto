import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrderApi } from '../../data/api';
import { orderFactory } from '../../tests/factories/order.factory';
import { OrderInvalidTransitionError } from '../entities';

import { OrderService } from './index';

vi.mock('../../data/api', () => ({
  OrderApi: {
    claimOrder: vi.fn(),
    advanceOrder: vi.fn(),
    finalizeOrder: vi.fn(),
    cancelOrder: vi.fn()
  }
}));

describe('OrderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deriveMacroState', () => {
    it.each([
      ['pending', 'pool'],
      ['confirming', 'attending'],
      ['picking', 'attending'],
      ['delivering', 'attending'],
      ['confirmed', 'done'],
      ['cancelled', 'cancelled'],
      ['expired', 'cancelled']
    ] as const)('should map "%s" to "%s"', (micro, macro) => {
      expect(OrderService.deriveMacroState(micro)).toBe(macro);
    });
  });

  describe('advance', () => {
    it('should call advance_order for confirming → picking', async () => {
      await OrderService.advance('o1', 'confirming');

      expect(OrderApi.advanceOrder).toHaveBeenCalledWith('o1');
      expect(OrderApi.finalizeOrder).not.toHaveBeenCalled();
    });

    it('should call advance_order for picking → delivering', async () => {
      await OrderService.advance('o1', 'picking');

      expect(OrderApi.advanceOrder).toHaveBeenCalledWith('o1');
    });

    it('should reject a transition from delivering (must use finalize)', async () => {
      await expect(OrderService.advance('o1', 'delivering')).rejects.toThrow(
        OrderInvalidTransitionError
      );
      expect(OrderApi.advanceOrder).not.toHaveBeenCalled();
      expect(OrderApi.finalizeOrder).not.toHaveBeenCalled();
    });

    it('should reject a transition from a terminal state', async () => {
      await expect(OrderService.advance('o1', 'confirmed')).rejects.toThrow(
        OrderInvalidTransitionError
      );
      await expect(OrderService.advance('o1', 'pending')).rejects.toThrow(
        OrderInvalidTransitionError
      );
    });
  });

  describe('finalize', () => {
    it('should call finalize_order for delivering → confirmed (RN087)', async () => {
      await OrderService.finalize('o1', 'delivering');

      expect(OrderApi.finalizeOrder).toHaveBeenCalledWith('o1');
    });

    it('should reject finalizing from any state other than delivering', async () => {
      await expect(OrderService.finalize('o1', 'picking')).rejects.toThrow(
        OrderInvalidTransitionError
      );
      expect(OrderApi.finalizeOrder).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should call cancel_order for any active state', async () => {
      await OrderService.cancel('o1', 'picking', 'Cliente desistiu');

      expect(OrderApi.cancelOrder).toHaveBeenCalledWith(
        'o1',
        'Cliente desistiu'
      );
    });

    it('should reject cancelling an already terminal order', async () => {
      await expect(
        OrderService.cancel('o1', 'confirmed', 'Motivo')
      ).rejects.toThrow(OrderInvalidTransitionError);
      expect(OrderApi.cancelOrder).not.toHaveBeenCalled();
    });
  });

  describe('filterOrders', () => {
    it('should filter by customer name or phone (case-insensitive)', () => {
      const orders = [
        orderFactory.build({
          customerName: 'Joana Silva',
          customerPhone: '111'
        }),
        orderFactory.build({
          customerName: 'Marcos Reis',
          customerPhone: '222'
        })
      ];

      const result = OrderService.filterOrders(orders, { search: 'joana' });

      expect(result).toHaveLength(1);
      expect(result[0].customerName).toBe('Joana Silva');
    });

    it('should filter by seller', () => {
      const orders = [
        orderFactory.build({ sellerId: 'seller-1' }),
        orderFactory.build({ sellerId: 'seller-2' })
      ];

      const result = OrderService.filterOrders(orders, {
        sellerId: 'seller-1'
      });

      expect(result).toHaveLength(1);
      expect(result[0].sellerId).toBe('seller-1');
    });

    it('should filter by period', () => {
      const now = Date.now();
      const orders = [
        orderFactory.build({ receivedAt: new Date(now) }),
        orderFactory.build({
          receivedAt: new Date(now - 40 * 24 * 60 * 60 * 1000)
        })
      ];

      const result = OrderService.filterOrders(orders, { period: '7d' });

      expect(result).toHaveLength(1);
    });

    it('should return all orders when no filters are set', () => {
      const orders = orderFactory.buildList(3);

      const result = OrderService.filterOrders(orders, {});

      expect(result).toHaveLength(3);
    });
  });

  describe('sortByLastAction', () => {
    it('should sort by lastActionAt descending', () => {
      const older = orderFactory.build({
        id: 'older',
        lastActionAt: new Date('2026-07-01T10:00:00Z')
      });
      const newer = orderFactory.build({
        id: 'newer',
        lastActionAt: new Date('2026-07-05T10:00:00Z')
      });

      const result = OrderService.sortByLastAction([older, newer]);

      expect(result.map((order) => order.id)).toEqual(['newer', 'older']);
    });
  });
});
