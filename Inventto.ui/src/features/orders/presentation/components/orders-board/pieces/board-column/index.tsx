import type { LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';

import type { Order } from '../../../../../domain/entities';
import { OrderCard } from '../../../order-card';

// Pool e Cancelados dividem o mesmo tom neutro no wireframe (ambos "fora do
// ciclo ativo") — só Em atendimento (alerta) e Finalizados (sucesso) ganham
// cor própria (DS §1.2).
type ColumnTone = 'neutral' | 'attention' | 'success';

const TONE_CLASSES: Record<
  ColumnTone,
  { border: string; dot: string; count: string }
> = {
  neutral: {
    border: 'border-l-muted-foreground/40',
    dot: 'bg-muted-foreground/50',
    count: 'bg-muted text-muted-foreground'
  },
  attention: {
    border: 'border-l-amber-500',
    dot: 'bg-amber-500',
    count: 'bg-amber-100 text-amber-800'
  },
  success: {
    border: 'border-l-green-600',
    dot: 'bg-green-600',
    count: 'bg-green-100 text-green-800'
  }
};

interface BoardColumnProps {
  title: string;
  tone: ColumnTone;
  orders: Order[];
  emptyText: string;
  emptyIcon: ComponentType<LucideProps>;
  newOrderIds?: Set<string>;
  onOpenDetail: (order: Order) => void;
  onCancelRequest: (order: Order) => void;
}

export function BoardColumn({
  title,
  tone,
  orders,
  emptyText,
  emptyIcon: EmptyIcon,
  newOrderIds,
  onOpenDetail,
  onCancelRequest
}: BoardColumnProps) {
  const toneClasses = TONE_CLASSES[tone];

  return (
    <div className="flex bg-sidebar min-w-0 flex-col overflow-hidden rounded-xl border lg:w-[320px] lg:flex-none">
      <div
        className={`flex items-center gap-2 border-b border-l-[3.5px] px-3.5 py-3 ${toneClasses.border}`}
      >
        <span className={`h-2 w-2 rounded-full ${toneClasses.dot}`} />
        <span className="text-xs font-semibold text-foreground">{title}</span>
        <span
          className={`ml-auto min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums ${toneClasses.count}`}
        >
          {orders.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 p-3">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2.5 py-6 text-center">
            <div className="flex h-10 w-10 bg-background items-center justify-center rounded-[11px] border border-dashed text-muted-foreground/70">
              <EmptyIcon className="size-[19px]" />
            </div>
            <p className="max-w-[24ch] text-[11.5px] leading-relaxed text-muted-foreground">
              {emptyText}
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isNew={newOrderIds?.has(order.id)}
              onOpenDetail={onOpenDetail}
              onCancelRequest={onCancelRequest}
            />
          ))
        )}
      </div>
    </div>
  );
}
