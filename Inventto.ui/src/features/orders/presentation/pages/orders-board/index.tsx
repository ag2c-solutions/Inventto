import { useState } from 'react';
import { toast } from 'sonner';

import { useOrganizationMembersQuery } from '@/features/organizations';

import type { Order, OrderFilters } from '../../../domain/entities';
import { OrdersBoard } from '../../components/orders-board';
import { OrdersBoardSkeleton } from '../../components/orders-board-skeleton';
import { OrdersFilters } from '../../components/orders-filters';
import { OrdersHeader } from '../../components/orders-header';
import { useCancelOrderMutation } from '../../hooks/use-mutations';
import { useOrdersQuery } from '../../hooks/use-queries';
import { useRealtimeOrders } from '../../hooks/use-realtime-orders';

export function OrdersBoardPage() {
  const [filters, setFilters] = useState<OrderFilters>({});
  const { data: orders = [], isLoading } = useOrdersQuery(filters);
  const { data: members = [] } = useOrganizationMembersQuery();
  const cancelMutation = useCancelOrderMutation();

  const { newOrderIds } = useRealtimeOrders();

  const inProgressCount = orders.filter(
    (order) => order.macroState === 'pool' || order.macroState === 'attending'
  ).length;

  // Sheet de atendimento é escopo do PED-04 — ainda não existe UI de detalhe.
  function handleOpenDetail(order: Order) {
    toast(`Pedido ${order.code} — detalhamento em breve.`);
  }

  // Modal com motivo obrigatório é escopo do PED-05. Interinamente, colhe o
  // motivo via prompt para manter "Cancelar" funcional ponta a ponta.
  function handleCancelRequest(order: Order) {
    const reason = window.prompt('Motivo do cancelamento:')?.trim();
    if (!reason) return;

    cancelMutation.mutate({
      id: order.id,
      microState: order.microState,
      reason
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-1 py-6 md:px-6">
      <OrdersHeader inProgressCount={inProgressCount} />

      <OrdersFilters
        filters={filters}
        onChange={setFilters}
        sellers={members}
      />

      {isLoading ? (
        <OrdersBoardSkeleton />
      ) : (
        <OrdersBoard
          orders={orders}
          newOrderIds={newOrderIds}
          onOpenDetail={handleOpenDetail}
          onCancelRequest={handleCancelRequest}
        />
      )}
    </div>
  );
}
