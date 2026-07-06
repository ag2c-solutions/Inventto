import type { RealtimeChannel } from '@supabase/supabase-js';

import { supabase } from '@/infra/supabase';

import type { Notification } from '../../domain/entities';
import type { NewOrderPayload } from '../dtos';
import { handleNotificationError } from '../handlers/error-handler';
import { NotificationMapper } from '../mappers';

export class NotificationsAPI {
  static async getLowStockNotification(
    organizationId: string
  ): Promise<Notification | null> {
    try {
      const { data, error } = await supabase.rpc('get_low_stock_count', {
        p_organization_id: organizationId
      });

      if (error) throw error;

      return NotificationMapper.fromLowStockCount(data as number);
    } catch (error) {
      return handleNotificationError(error, 'getLowStockCount');
    }
  }

  static subscribeToOrders(
    organizationId: string,
    onInsert: (notification: Notification) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel('orders_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `organization_id=eq.${organizationId}`
        },
        (payload) => {
          onInsert(
            NotificationMapper.fromOrderPayload(payload.new as NewOrderPayload)
          );
        }
      )
      .subscribe();

    return channel;
  }
}
