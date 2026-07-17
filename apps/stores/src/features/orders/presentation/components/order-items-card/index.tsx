import { ShoppingBag } from 'lucide-react';

import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import type { Order } from '../../../domain/entities';

interface OrderItemsCardProps {
  order: Order;
}

export function OrderItemsCard({ order }: OrderItemsCardProps) {
  const itemsCount = order.items.length;

  return (
    <div className="rounded-lg border">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-2">
        <ShoppingBag className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">
          Itens · {itemsCount}
        </span>
      </div>

      <div className="flex flex-col divide-y">
        {order.items.map((item) => (
          <div
            key={`${item.productId ?? ''}-${item.variantId ?? ''}-${item.name}`}
            className="flex items-center gap-2 px-3 py-2"
          >
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium text-foreground">
                {item.name}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {item.quantity}×
            </span>
            <span className="w-20 text-right text-sm font-semibold tabular-nums text-foreground">
              {formatCurrency(item.unitPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-2">
        <span className="text-xs font-semibold text-muted-foreground">
          Total do pedido
        </span>
        <span className="text-sm font-bold tabular-nums text-foreground">
          {formatCurrency(order.total)}
        </span>
      </div>
    </div>
  );
}
