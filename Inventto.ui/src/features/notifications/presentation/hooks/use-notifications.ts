import { useEffect, useState } from 'react';

import { useUser } from '@/features/users';

import type { Notification } from '../../domain/entities';
import { NotificationsService } from '../../domain/services';

import { useLowStockQuery } from './use-queries';

export const useNotifications = () => {
  const { currentOrganization } = useUser();
  const organizationId = currentOrganization?.id;

  const [ordersNotifications, setOrdersNotifications] = useState<
    Notification[]
  >([]);

  const { data: realLowStockNotification = null } = useLowStockQuery();

  const lowStockNotification =
    realLowStockNotification ||
    ({
      id: 'mock-low-stock-alert',
      type: 'low-stock',
      message: 'Estoque baixo em 3 produtos.',
      timestamp: new Date().toISOString(),
      route: '/produtos',
      isRead: false
    } as Notification);

  useEffect(() => {
    if (!organizationId) {
      setOrdersNotifications([]);
    }

    const channel = NotificationsService.subscribeToOrders(
      organizationId,
      (notification) => {
        setOrdersNotifications((prev) => [notification, ...prev]);
      }
    );

    return () => {
      channel?.unsubscribe();
    };
  }, [organizationId]);

  const markAllAsRead = () => {
    setOrdersNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
  };

  const allNotifications = [...ordersNotifications];
  if (lowStockNotification) {
    allNotifications.unshift(lowStockNotification);
  }

  const unreadCount = allNotifications.filter((n) => !n.isRead).length;

  return {
    notifications: allNotifications,
    unreadCount,
    markAllAsRead,
    hasNotifications: allNotifications.length > 0
  };
};
