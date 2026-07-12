import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ban, Clock, CreditCard, Info, Store, User } from 'lucide-react';

import type { Order } from '../../../domain/entities';
import { PAYMENT_METHOD_LABELS } from '../../constants';
import { OrderTimer } from '../order-timer';

interface OrderMetaCardProps {
  order: Order;
}

// RN083: origem é sempre "Vitrine online" — só pedidos channel="catalog_store"
// passam pelo painel de Pedidos Online (RN081/RN088 recortam o resto).
function originLabel(order: Order): string {
  return order.catalogName
    ? `Vitrine online · ${order.catalogName}`
    : 'Vitrine online';
}

export function OrderMetaCard({ order }: OrderMetaCardProps) {
  const isPool = order.macroState === 'pool';
  const sellerLabel = isPool ? 'Pool' : (order.sellerName ?? '—');

  return (
    <div className="rounded-lg border">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-2">
        <Info className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">
          Detalhes
        </span>
      </div>

      <div className="flex flex-col gap-2.5 p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-3.5" />
            Recebido
          </span>
          <span className="font-medium text-foreground">
            {formatDistanceToNow(order.receivedAt, {
              addSuffix: true,
              locale: ptBR
            })}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <User className="size-3.5" />
            Vendedor
          </span>
          <span className="font-medium text-foreground">{sellerLabel}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Store className="size-3.5" />
            Origem
          </span>
          <span className="font-medium text-foreground">
            {originLabel(order)}
          </span>
        </div>

        {order.paymentMethod && (
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <CreditCard className="size-3.5" />
              Pagamento
            </span>
            <span className="font-medium text-foreground">
              {PAYMENT_METHOD_LABELS[order.paymentMethod]}
            </span>
          </div>
        )}

        {isPool && order.expiresAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Expira em</span>
            <OrderTimer expiresAt={order.expiresAt} />
          </div>
        )}

        {order.cancellationReason && (
          <div className="flex flex-col gap-1 text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Ban className="size-3.5" />
              Motivo do encerramento
            </span>
            <span className="text-foreground">{order.cancellationReason}</span>
          </div>
        )}
      </div>
    </div>
  );
}
