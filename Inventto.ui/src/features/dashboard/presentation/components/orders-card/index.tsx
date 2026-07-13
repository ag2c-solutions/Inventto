import { Link } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Ban,
  CheckCircle2,
  ClipboardList,
  Clock,
  Info,
  type LucideIcon,
  Package,
  ShoppingBag,
  Truck
} from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import type { RecentOrder } from '../../../domain/entities';

interface StatusMeta {
  label: string;
  icon: LucideIcon;
  className: string;
}

// Recorte próprio do dashboard (não reusa o mapa de status dos pedidos —
// boundaries entre features) para o mesmo conjunto de OrderMicroState.
const STATUS_META: Record<string, StatusMeta> = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    className:
      'border-[var(--status-warning)]/30 bg-[var(--status-warning-soft)] text-[var(--status-warning)]'
  },
  confirming: {
    label: 'Confirmando',
    icon: Info,
    className:
      'border-[var(--status-warning)]/30 bg-[var(--status-warning-soft)] text-[var(--status-warning)]'
  },
  picking: {
    label: 'Em separação',
    icon: Package,
    className:
      'border-[var(--status-zeroed)]/30 bg-[var(--status-zeroed-soft)] text-[var(--status-zeroed)]'
  },
  delivering: {
    label: 'Em entrega',
    icon: Truck,
    className:
      'border-[var(--status-zeroed)]/30 bg-[var(--status-zeroed-soft)] text-[var(--status-zeroed)]'
  },
  confirmed: {
    label: 'Confirmado',
    icon: CheckCircle2,
    className:
      'border-[var(--status-healthy)]/30 bg-[var(--status-healthy-soft)] text-[var(--status-healthy)]'
  },
  cancelled: {
    label: 'Cancelado',
    icon: Ban,
    className:
      'border-[var(--status-critical)]/30 bg-[var(--status-critical-soft)] text-[var(--status-critical)]'
  },
  expired: {
    label: 'Expirado',
    icon: Clock,
    className:
      'border-[var(--status-zeroed)]/40 bg-transparent text-[var(--status-zeroed)]'
  }
};

interface OrdersCardProps {
  orders: RecentOrder[];
}

export function OrdersCard({ orders }: OrdersCardProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <ClipboardList className="size-3.5 text-muted-foreground" />
        <h3 className="text-xs font-semibold tracking-wide uppercase">
          Últimos pedidos
        </h3>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="ml-auto h-7 rounded-full px-3 text-xs"
        >
          <Link to="/pedidos">Ver painel</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          Nenhum pedido recente.
        </p>
      ) : (
        <ul>
          {orders.map((order) => {
            const meta = STATUS_META[order.status] ?? STATUS_META.pending;
            const Icon = meta.icon;

            return (
              <li
                key={order.id}
                className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
              >
                <span className="min-w-0 flex gap-2 flex-1">
                  <figure className="rounded-md bg-sidebar/80 border size-8 flex items-center justify-center">
                    <ShoppingBag className="size-4 text-sidebar-foreground" />
                  </figure>
                  <div>
                    <span className="block truncate text-sm font-medium">
                      {order.customerName ?? 'Cliente não identificado'}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      <span className="font-mono">#{order.code}</span> ·{' '}
                      {formatDistanceToNow(order.updatedAt, {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </span>
                  </div>
                </span>
                <div className="flex flex-col gap-1 items-end">
                  <Badge
                    className={cn(
                      'gap-1 font-medium text-[10px]',
                      meta.className
                    )}
                  >
                    <Icon className="size-2" />
                    {meta.label}
                  </Badge>
                  <span className="shrink-0 font-mono text-sm font-bold mr-1">
                    {formatCurrency(order.total) ?? 'R$ 0,00'}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
