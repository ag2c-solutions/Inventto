import type { RealtimeChannel } from '@supabase/supabase-js';

import { NotificationsAPI } from '../../data/api';
import type { Notification } from '../entities';

export class NotificationsService {
  static async getLowStockNotification(
    organizationId?: string
  ): Promise<Notification | null> {
    if (!organizationId) {
      return null;
    }

    return NotificationsAPI.getLowStockNotification(organizationId);
  }

  static subscribeToOrders(
    organizationId: string | undefined,
    onInsert: (notification: Notification) => void
  ): RealtimeChannel | null {
    if (!organizationId) {
      return null;
    }

    return NotificationsAPI.subscribeToOrders(organizationId, onInsert);
  }
}
