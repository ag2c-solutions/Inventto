import { Link } from 'react-router';
import {
  ArrowRight,
  CalendarClock,
  Check,
  Layers,
  MessageCircle,
  TriangleAlert
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog';
import { cn } from '@/shared/utils';

import type { PublishPrereqKey, Storefront } from '../../../domain/entities';

import { usePublishPrereqs } from './hooks/use-publish-prereqs';

const PREREQ_ICONS: Record<PublishPrereqKey, typeof Layers> = {
  catalog: Layers,
  whatsapp: MessageCircle,
  hours: CalendarClock
};

interface PublishDialogProps {
  storefront: Storefront;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublishDialog({
  storefront,
  open,
  onOpenChange
}: PublishDialogProps) {
  const { items, firstPendingHref } = usePublishPrereqs(storefront);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md!">
        <DialogHeader className="items-center text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
            <TriangleAlert className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          </div>
          <DialogTitle>Quase lá para publicar</DialogTitle>
          <DialogDescription>
            Para publicar {storefront.name}, ainda falta:
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1">
          {items.map((item) => {
            const Icon = PREREQ_ICONS[item.key];

            const content = (
              <>
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    item.done
                      ? 'bg-green-100 text-green-700'
                      : 'bg-sidebar text-muted-foreground'
                  )}
                >
                  {item.done ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col text-left">
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.subtitle}
                  </span>
                </span>
                {!item.done && (
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </>
            );

            if (item.done) {
              return (
                <div
                  key={item.key}
                  className="flex items-center gap-3 rounded-lg p-2 opacity-60"
                >
                  {content}
                </div>
              );
            }

            return (
              <Link
                key={item.key}
                to={item.href}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar/70"
              >
                {content}
              </Link>
            );
          })}
        </div>

        <DialogFooter className="grid grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Agora não
          </Button>
          <Button asChild className="w-full">
            <Link to={firstPendingHref ?? `/storefronts/${storefront.id}`}>
              Completar configuração
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
