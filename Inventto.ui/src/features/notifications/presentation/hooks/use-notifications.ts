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
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const { data: lowStockNotification = null } = useLowStockQuery();

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

  const rawNotifications = lowStockNotification
    ? [lowStockNotification, ...ordersNotifications]
    : ordersNotifications;

  const allNotifications = rawNotifications.map((notification) => ({
    ...notification,
    isRead: notification.isRead || readIds.has(notification.id)
  }));

  const markAllAsRead = () => {
    setReadIds((prev) => {
      const next = new Set(prev);
      rawNotifications.forEach((notification) => next.add(notification.id));
      return next;
    });
  };

  const unreadCount = allNotifications.filter((n) => !n.isRead).length;

  return {
    notifications: allNotifications,
    unreadCount,
    markAllAsRead,
    hasNotifications: allNotifications.length > 0
  };
};
