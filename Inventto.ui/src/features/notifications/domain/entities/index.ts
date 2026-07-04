export type NotificationType = 'new-order' | 'low-stock';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string; // ISO string
  route: string;
  isRead: boolean;
}
