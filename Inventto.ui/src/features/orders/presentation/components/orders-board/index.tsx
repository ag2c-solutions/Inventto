import { useMemo } from 'react';
import { Archive, Inbox } from 'lucide-react';

import type { Order } from '../../../domain/entities';
import { OrderService } from '../../../domain/services';

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
export function OrdersBoard({
  orders,
  newOrderIds,
  onOpenDetail,
  onCancelRequest
}: OrdersBoardProps) {
  const columns = useMemo(() => {
    const byMacro = (macro: Order['macroState']) =>
      orders.filter((order) => order.macroState === macro);

    return {
      pool: byMacro('pool'),
      attending: OrderService.sortByLastAction(byMacro('attending')),
      done: byMacro('done'),
      cancelled: byMacro('cancelled')
    };
  }, [orders]);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:gap-3.5 lg:overflow-x-auto lg:pb-2">
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
