import { describe, expect, it, vi } from 'vitest';

import { NotificationsAPI } from '../../data/api';
import { notificationFactory } from '../../tests/factories/notification.factory';

import { NotificationsService } from '.';

vi.mock('../../data/api');

describe('NotificationsService', () => {
  describe('getLowStockNotification', () => {
    it('should return null without calling the API when organizationId is missing', async () => {
      const result =
        await NotificationsService.getLowStockNotification(undefined);

      expect(result).toBeNull();
      expect(NotificationsAPI.getLowStockNotification).not.toHaveBeenCalled();
    });

    it('should delegate to the API when organizationId is present', async () => {
      const notification = notificationFactory.build({ type: 'low-stock' });
      vi.mocked(NotificationsAPI.getLowStockNotification).mockResolvedValue(
        notification
      );

      const result =
        await NotificationsService.getLowStockNotification('org-1');

      expect(NotificationsAPI.getLowStockNotification).toHaveBeenCalledWith(
        'org-1'
      );
      expect(result).toEqual(notification);
    });
  });

  describe('subscribeToOrders', () => {
    it('should return null without subscribing when organizationId is missing', () => {
      const onInsert = vi.fn();

      const result = NotificationsService.subscribeToOrders(
        undefined,
        onInsert
      );

      expect(result).toBeNull();
      expect(NotificationsAPI.subscribeToOrders).not.toHaveBeenCalled();
    });

    it('should delegate to the API when organizationId is present', () => {
      const onInsert = vi.fn();
      const channel = { unsubscribe: vi.fn() };
      vi.mocked(NotificationsAPI.subscribeToOrders).mockReturnValue(
        channel as never
      );

      const result = NotificationsService.subscribeToOrders('org-1', onInsert);

      expect(NotificationsAPI.subscribeToOrders).toHaveBeenCalledWith(
        'org-1',
        onInsert
      );
      expect(result).toBe(channel);
    });
  });
});
