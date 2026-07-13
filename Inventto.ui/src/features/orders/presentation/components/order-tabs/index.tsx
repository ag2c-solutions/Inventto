import { useState } from 'react';
import { Archive, Inbox, type LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/shared/components/ui/tabs';

import type { Order, OrderMacroState } from '../../../domain/entities';
import { useOrderColumns } from '../../hooks/use-order-columns';
import { OrderCard } from '../order-card';

interface OrderTabsProps {
  orders: Order[];
  newOrderIds?: Set<string>;
  onOpenDetail: (order: Order) => void;
  onCancelRequest: (order: Order) => void;
}

interface TabConfig {
  macro: OrderMacroState;
  label: string;
  emptyText: string;
  emptyIcon: ComponentType<LucideProps>;
}

// Mesmos rótulos/microcopy das colunas do Kanban (BoardColumn) — só muda a
// apresentação: uma coluna por vez, escolhida pela Tab ativa.
const TABS: TabConfig[] = [
  {
    macro: 'pool',
    label: 'Pool',
    emptyText: 'Nenhum pedido pendente. Os novos chegam aqui em tempo real.',
    emptyIcon: Inbox
  },
  {
    macro: 'attending',
    label: 'Em atendimento',
    emptyText: 'Nenhum pedido em atendimento agora.',
    emptyIcon: Archive
  },
  {
    macro: 'done',
    label: 'Finalizados',
    emptyText: 'Nenhum pedido encerrado neste período.',
    emptyIcon: Archive
  },
  {
    macro: 'cancelled',
    label: 'Cancelados',
    emptyText: 'Nenhum pedido encerrado neste período.',
    emptyIcon: Archive
  }
];

// PED-06: Painel mobile (<lg) — Tabs no lugar do Kanban, uma por
// macro-estado (RF034), cada uma com contador e microcopy de vazio própria.
export function OrderTabs({
  orders,
  newOrderIds,
  onOpenDetail,
  onCancelRequest
}: OrderTabsProps) {
  const columns = useOrderColumns(orders);
  const [active, setActive] = useState<OrderMacroState>('pool');

  return (
    <Tabs
      value={active}
      onValueChange={(value) => setActive(value as OrderMacroState)}
    >
      <TabsList className="w-full flex-wrap h-20 sm:flex-nowrap ">
        {TABS.map(({ macro, label }) => (
          <TabsTrigger key={macro} value={macro} className="gap-1.5 h-10">
            {label}
            <span className="min-w-[18px] rounded-full bg-muted px-1 text-center text-[10px] font-bold tabular-nums text-muted-foreground">
              {columns[macro].length}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map(({ macro, emptyText, emptyIcon: EmptyIcon }) => {
        const list = columns[macro];

        return (
          <TabsContent
            key={macro}
            value={macro}
            className="flex flex-col gap-2.5 pt-3"
          >
            {list.length === 0 ? (
              <div className="flex flex-col items-center gap-2.5 py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-[11px] border border-dashed bg-background text-muted-foreground/70">
                  <EmptyIcon className="size-[19px]" />
                </div>
                <p className="max-w-[24ch] text-[11.5px] leading-relaxed text-muted-foreground">
                  {emptyText}
                </p>
              </div>
            ) : (
              list.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isNew={macro === 'pool' ? newOrderIds?.has(order.id) : false}
                  onOpenDetail={onOpenDetail}
                  onCancelRequest={onCancelRequest}
                />
              ))
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
