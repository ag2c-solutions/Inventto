import { describe, expect, it } from 'vitest';

import { newOrderPayloadFactory } from '../../tests/factories/notification.factory';

import { NotificationMapper } from '.';

describe('NotificationMapper', () => {
  describe('fromOrderPayload', () => {
    it('should map a new order payload to a notification', () => {
      const payload = newOrderPayloadFactory.build({
        id: 'order-1',
        created_at: '2026-01-01T10:00:00.000Z'
      });

      const notification = NotificationMapper.fromOrderPayload(payload);

      expect(notification).toEqual({
        id: 'order-order-1',
        type: 'new-order',
        message: 'Novo pedido recebido.',
        timestamp: '2026-01-01T10:00:00.000Z',
        route: '/pedidos/order-1',
        isRead: false
      });
    });

    it('should fallback to the current date when created_at is empty', () => {
      const payload = newOrderPayloadFactory.build({ created_at: '' });

      const notification = NotificationMapper.fromOrderPayload(payload);

      expect(() => new Date(notification.timestamp)).not.toThrow();
      expect(notification.timestamp).not.toBe('');
    });
  });

  describe('fromLowStockCount', () => {
    it('should return null when count is zero', () => {
      expect(NotificationMapper.fromLowStockCount(0)).toBeNull();
    });

    it('should return null when count is negative', () => {
      expect(NotificationMapper.fromLowStockCount(-1)).toBeNull();
    });

    it('should pluralize the message for more than one product', () => {
      const notification = NotificationMapper.fromLowStockCount(3);

      expect(notification).toEqual({
        id: 'low-stock-alert',
        type: 'low-stock',
        message: 'Estoque baixo em 3 produtos.',
        timestamp: expect.any(String),
        route: '/produtos',
        isRead: false
      });
    });

    it('should keep the message singular for exactly one product', () => {
      const notification = NotificationMapper.fromLowStockCount(1);

      expect(notification?.message).toBe('Estoque baixo em 1 produto.');
    });
  });
});
