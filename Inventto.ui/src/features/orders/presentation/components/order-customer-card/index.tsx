import { MessageCircle, Phone, User } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';

import type { Order } from '../../../domain/entities';
import { buildWhatsAppUrl } from '../../utils/build-whatsapp-url';

interface OrderCustomerCardProps {
  order: Order;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function OrderCustomerCard({ order }: OrderCustomerCardProps) {
  const name = order.customerName ?? 'Cliente não identificado';
  const whatsAppUrl = buildWhatsAppUrl(order);

  return (
    <div className="rounded-lg border">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-2">
        <User className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">
          Cliente
        </span>
      </div>

      <div className="flex flex-col gap-3 p-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="text-xs font-semibold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">{name}</span>
            {order.customerPhone && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="size-3" />
                {order.customerPhone}
              </span>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!whatsAppUrl}
          className="gap-1.5"
          asChild={!!whatsAppUrl}
        >
          {whatsAppUrl ? (
            <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-3.5" />
              Chamar no WhatsApp
            </a>
          ) : (
            <>
              <MessageCircle className="size-3.5" />
              Chamar no WhatsApp
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
