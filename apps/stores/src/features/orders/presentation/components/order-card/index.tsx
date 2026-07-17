import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ShoppingBag, User, Zap } from 'lucide-react';

import { Card } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import type { Order } from '../../../domain/entities';
import { OrderCardBadge } from '../order-card-badge';
import { OrderTimer } from '../order-timer';

import { useOrderCardActions } from './hooks/use-order-card-actions';
import { OrderCardFooter } from './pieces/order-card-footer';

interface OrderCardProps {
  order: Order;
  isNew?: boolean;
  onOpenDetail: (order: Order) => void;
  onCancelRequest: (order: Order) => void;
}

// Card de pedido (RF034) — corpo navega (abre a Sheet, PED-04), rodapé age
// (Chat + DropdownMenu, condicionados ao macro/micro-estado).
export function OrderCard({
  order,
  isNew,
  onOpenDetail,
  onCancelRequest
}: OrderCardProps) {
  const {
    chatAction,
    menuActions,
    isMenuDisabled,
    onOpenDetail: openDetail,
    isPending
  } = useOrderCardActions({ order, onOpenDetail, onCancelRequest });

  const isClosed =
    order.macroState === 'done' || order.macroState === 'cancelled';
  const itemsCount = order.items.length;

  return (
    <Card
      className={`gap-0 overflow-hidden py-0 ${isClosed ? 'opacity-75' : ''} ${
        isNew ? 'ring-2 ring-amber-500' : ''
      }`}
    >
      {isNew && (
        <span className="ml-3 -mb-2.5 inline-flex w-fit items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
          <Zap className="size-2.5" />
          Novo
        </span>
      )}

      <button
        type="button"
        onClick={openDetail}
        className="grid grid-cols-[1fr_auto] items-center gap-x-2.5 gap-y-2 p-3 text-left hover:bg-muted/40"
      >
        <span className="font-mono text-[11.5px] font-semibold text-muted-foreground">
          {order.code}
        </span>
        {order.expiresAt ? (
          <OrderTimer expiresAt={order.expiresAt} />
        ) : (
          <span />
        )}

        <span className="truncate text-sm font-bold text-foreground">
          {order.customerName ?? 'Cliente não identificado'}
        </span>
        <OrderCardBadge microState={order.microState} />

        <span className="inline-flex items-center gap-1.5 text-xs text-foreground">
          <ShoppingBag className="size-3.5 text-muted-foreground" />
          {itemsCount} {itemsCount > 1 ? 'itens' : 'item'}
        </span>
        <span className="justify-self-end text-[13px] font-bold tabular-nums text-foreground">
          {formatCurrency(order.total)}
        </span>

        <span className="text-[11px] text-muted-foreground">
          {formatDistanceToNow(order.lastActionAt, {
            addSuffix: true,
            locale: ptBR
          })}
        </span>
        {order.cancellationReason ? (
          <span className="inline-flex max-w-[124px] items-center gap-1.5 justify-self-end truncate text-[11px] text-muted-foreground">
            {order.cancellationReason}
          </span>
        ) : order.sellerName ? (
          <span className="inline-flex max-w-[124px] items-center gap-1.5 justify-self-end truncate text-[11px] text-muted-foreground">
            <User className="size-3 shrink-0" />
            {order.sellerName}
          </span>
        ) : (
          <span />
        )}
      </button>

      <OrderCardFooter
        chatAction={chatAction}
        menuActions={menuActions}
        isMenuDisabled={isMenuDisabled}
        isPending={isPending}
      />
    </Card>
  );
}
