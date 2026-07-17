import { Archive, Inbox } from 'lucide-react';

import { useIsMobile } from '@/shared/hooks/use-is-mobile';

import type { Order } from '../../../domain/entities';
import { useOrderColumns } from '../../hooks/use-order-columns';
import { OrderTabs } from '../order-tabs';

import { BoardColumn } from './pieces/board-column';

interface OrdersBoardProps {
  orders: Order[];
  newOrderIds?: Set<string>;
  onOpenDetail: (order: Order) => void;
  onCancelRequest: (order: Order) => void;
}

// Microcopy por coluna (§4 do wireframe) — cada macro-estado tem seu texto
// de "nada por aqui ainda", não uma mensagem genérica.
const EMPTY_TEXT = {
  pool: 'Nenhum pedido pendente. Os novos chegam aqui em tempo real.',
  attending: 'Nenhum pedido em atendimento agora.',
  done: 'Nenhum pedido encerrado neste período.',
  cancelled: 'Nenhum pedido encerrado neste período.'
} as const;

// RF034: 4 colunas por macro-estado — Pool · Em atendimento · Finalizados ·
// Cancelados. "Em atendimento" ordenada pela última ação (RN082/RF034).
// PED-06: no mobile (<768px — mesmo corte de CAT-05/PDV-04, useIsMobile) o
// Kanban vira Tabs (OrderTabs); a troca de árvore precisa ser em JS porque
// só uma coluna fica visível por vez, não dá pra resolver só com `lg:`.
export function OrdersBoard({
  orders,
  newOrderIds,
  onOpenDetail,
  onCancelRequest
}: OrdersBoardProps) {
  const isMobile = useIsMobile();
  const columns = useOrderColumns(orders);

  if (isMobile) {
    return (
      <OrderTabs
        orders={orders}
        newOrderIds={newOrderIds}
        onOpenDetail={onOpenDetail}
        onCancelRequest={onCancelRequest}
      />
    );
  }

  return (
    <div className="flex gap-3.5 overflow-x-auto pb-2">
      <BoardColumn
        title="Pool"
        tone="neutral"
        orders={columns.pool}
        emptyText={EMPTY_TEXT.pool}
        emptyIcon={Inbox}
        newOrderIds={newOrderIds}
        onOpenDetail={onOpenDetail}
        onCancelRequest={onCancelRequest}
      />
      <BoardColumn
        title="Em atendimento"
        tone="attention"
        orders={columns.attending}
        emptyText={EMPTY_TEXT.attending}
        emptyIcon={Archive}
        onOpenDetail={onOpenDetail}
        onCancelRequest={onCancelRequest}
      />
      <BoardColumn
        title="Finalizados"
        tone="success"
        orders={columns.done}
        emptyText={EMPTY_TEXT.done}
        emptyIcon={Archive}
        onOpenDetail={onOpenDetail}
        onCancelRequest={onCancelRequest}
      />
      <BoardColumn
        title="Cancelados"
        tone="neutral"
        orders={columns.cancelled}
        emptyText={EMPTY_TEXT.cancelled}
        emptyIcon={Archive}
        onOpenDetail={onOpenDetail}
        onCancelRequest={onCancelRequest}
      />
    </div>
  );
}
