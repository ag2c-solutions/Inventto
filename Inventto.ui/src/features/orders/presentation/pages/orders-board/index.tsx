import { useState } from 'react';

import { Skeleton } from '@/shared/components/ui/skeleton';

import { useOrganizationMembersQuery } from '@/features/organizations';

import type { OrderFilters } from '../../../domain/entities';
import { OrdersBoard } from '../../components/orders-board';
import { OrdersFilters } from '../../components/orders-filters';
import { OrdersHeader } from '../../components/orders-header';
import { useOrdersQuery } from '../../hooks/use-queries';
import { useRealtimeOrders } from '../../hooks/use-realtime-orders';

export function OrdersBoardPage() {
  const [filters, setFilters] = useState<OrderFilters>({});
  const { data: orders = [], isLoading } = useOrdersQuery(filters);
  const { data: members = [] } = useOrganizationMembersQuery();

  useRealtimeOrders();

  const inProgressCount = orders.filter(
    (order) => order.macroState === 'pool' || order.macroState === 'attending'
  ).length;

  return (
    <div className="flex flex-1 flex-col gap-6 px-1 py-6 md:px-6">
      <OrdersHeader inProgressCount={inProgressCount} />

      <OrdersFilters
        filters={filters}
        onChange={setFilters}
        sellers={members}
      />

      {isLoading ? (
        <div className="flex flex-col gap-3 lg:flex-row">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-64 flex-1 rounded-xl" />
          ))}
        </div>
      ) : (
        <OrdersBoard orders={orders} />
      )}
    </div>
  );
}
