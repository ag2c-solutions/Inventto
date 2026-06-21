export type NotificationType = 'new-order' | 'low-stock';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string; // ISO string
  route: string;
  isRead: boolean;
  metadata?: Record<string, any>;
}

export interface LowStockCountResult {
  count: number;
}

export interface NewOrderPayload {
  id: string;
  organization_id: string;
  created_at: string;
}
