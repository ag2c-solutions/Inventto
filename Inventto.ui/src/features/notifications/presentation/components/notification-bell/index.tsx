import { useState } from 'react';
import { BellIcon } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/components/ui/popover';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';

import { useNotifications } from '../../hooks/use-notifications';

import { NotificationEmpty } from './pieces/notification-empty';
import { NotificationItem } from './pieces/notification-item';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead, hasNotifications } =
    useNotifications();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full cursor-pointer"
          aria-label="Notificações"
        >
          <BellIcon className="size-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-semibold text-sm">Notificações</h4>
          {hasNotifications && (
            <Badge
              variant="secondary"
              className="text-[13px] bg-slate-100/80 hover:bg-slate-100/80 text-slate-500 font-medium px-2.5 py-0.5 rounded-md"
            >
              {notifications.length} novas
            </Badge>
          )}
        </div>
        <Separator />
        {hasNotifications ? (
          <ScrollArea className="h-fit max-h-[300px]">
            <div className="flex flex-col">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onClose={() => setIsOpen(false)}
                  />
                  {index < notifications.length - 1 && (
                    <Separator className="bg-border/40" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <NotificationEmpty />
        )}
      </PopoverContent>
    </Popover>
  );
};
