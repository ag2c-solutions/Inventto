import { Link } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangleIcon, ReceiptIcon } from 'lucide-react';

import type { Notification } from '../../../../../domain/entities';

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

export const NotificationItem = ({
  notification,
  onClose
}: NotificationItemProps) => {
  const isLowStock = notification.type === 'low-stock';
  const Icon = isLowStock ? AlertTriangleIcon : ReceiptIcon;
  const iconColor = isLowStock ? 'text-red-700' : 'text-muted-foreground';

  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <div className="flex items-start gap-2 p-2">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted/60">
        <Icon className={`size-[22px] ${iconColor}`} strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-1.5 pt-0.5">
        <p className="text-[14px] leading-tight text-foreground">
          {notification.message}
        </p>
        <p className="text-[12px] text-muted-foreground">{timeAgo}</p>
        <div className="pt-1">
          <Link
            to={notification.route}
            onClick={onClose}
            className="text-[12px] font-semibold text-foreground underline underline-offset-4 decoration-1 hover:text-primary transition-colors"
          >
            {isLowStock ? 'Ver produtos' : 'Ver pedido'}
          </Link>
        </div>
      </div>
    </div>
  );
};
