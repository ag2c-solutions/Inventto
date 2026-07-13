import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { useOrganizationMembersQuery } from '@/features/organizations';

import type { Order, OrderFilters } from '../../../domain/entities';
import { CancelOrderDialog } from '../../components/cancel-order-dialog';
import { OrderSheet } from '../../components/order-sheet';
import { OrdersBoard } from '../../components/orders-board';
import { OrdersBoardSkeleton } from '../../components/orders-board-skeleton';
import { OrdersFilters } from '../../components/orders-filters';
import { OrdersHeader } from '../../components/orders-header';
import { useOpenOrderSheet } from '../../hooks/use-open-order-sheet';
import { useOrdersQuery } from '../../hooks/use-queries';
import { useRealtimeOrders } from '../../hooks/use-realtime-orders';
import { useOrderSheetStore } from '../../stores/order-sheet-store';

export function OrdersBoardPage() {
  const [filters, setFilters] = useState<OrderFilters>({});
  const { data: orders = [], isLoading } = useOrdersQuery(filters);
  const { data: members = [] } = useOrganizationMembersQuery();
  const [orderToCancel, setOrderToCancel] = useState<Order>();

  const { newOrderIds } = useRealtimeOrders();

  const navigate = useNavigate();
  const { id: routeOrderId } = useParams<{ id?: string }>();
  const openOrderSheet = useOpenOrderSheet();
  const sheetOrderId = useOrderSheetStore((state) => state.orderId);
  // Marca que a Sheet chegou a abrir para este :id antes de navegar de
  // volta ao fechar — sem isso, o efeito de fechamento dispararia no mount
  // (sheetOrderId só reflete o store um commit depois do openOrderSheet).
  const hasOpenedSheetRef = useRef(false);

  // A rota /pedidos/:id (deep-link — ex.: link do e-mail de expiração,
  // RN089) abre a mesma Sheet controlada pelo store. Ver "Ponto de
  // verificação" do PED-04.
  useEffect(() => {
    if (routeOrderId) openOrderSheet(routeOrderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeOrderId]);

  // Fechar a Sheet (X, "Pedidos", Finalizar) volta a URL para /pedidos
  // quando o deep-link a trouxe até /pedidos/:id.
  useEffect(() => {
    if (sheetOrderId) {
      hasOpenedSheetRef.current = true;
      return;
    }

    if (hasOpenedSheetRef.current && routeOrderId) {
      hasOpenedSheetRef.current = false;
      navigate('/pedidos', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetOrderId]);

  const inProgressCount = orders.filter(
    (order) => order.macroState === 'pool' || order.macroState === 'attending'
  ).length;

  function handleOpenDetail(order: Order) {
    navigate(`/pedidos/${order.id}`);
    openOrderSheet(order.id);
  }

  function handleCancelRequest(order: Order) {
    setOrderToCancel(order);
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

      <OrderSheet onCancelRequest={handleCancelRequest} />

      <CancelOrderDialog
        order={orderToCancel}
        open={!!orderToCancel}
        onOpenChange={(open) => {
          if (!open) setOrderToCancel(undefined);
        }}
      />
    </div>
  );
}
