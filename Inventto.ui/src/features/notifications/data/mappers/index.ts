import type { NewOrderPayload, Notification } from '../../domain/entities';

export class NotificationMapper {
  static fromOrderPayload(payload: NewOrderPayload): Notification {
    return {
      id: `order-${payload.id}`,
      type: 'new-order',
      message: 'Novo pedido recebido.',
      timestamp: payload.created_at || new Date().toISOString(),
      route: `/pedidos/${payload.id}`,
      isRead: false
    };
  }

  static fromLowStockCount(count: number): Notification | null {
    if (count <= 0) return null;

    return {
      id: 'low-stock-alert',
      type: 'low-stock',
      message: `Estoque baixo em ${count} produto${count > 1 ? 's' : ''}.`,
      timestamp: new Date().toISOString(),
      route: '/produtos',
      isRead: false
    };
  }
}
