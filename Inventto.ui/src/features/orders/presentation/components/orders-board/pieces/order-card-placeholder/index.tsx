import { Card, CardContent } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import type { Order } from '../../../../../domain/entities';

interface OrderCardPlaceholderProps {
  order: Order;
}

// Card mínimo para o board funcionar nesta task — o card de 2 zonas
// (com ações da esteira) é escopo do PED-02.
export function OrderCardPlaceholder({ order }: OrderCardPlaceholderProps) {
  return (
    <Card className="gap-2 py-3">
      <CardContent className="flex flex-col gap-1 px-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">
            {order.customerName ?? 'Cliente não identificado'}
          </span>
          <span className="text-xs text-muted-foreground">{order.code}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{order.sellerName ?? 'Sem vendedor'}</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
