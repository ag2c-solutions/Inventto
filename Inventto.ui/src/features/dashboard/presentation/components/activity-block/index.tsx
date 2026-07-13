import type { Role } from '@/features/permissions';

import { useRecentActivityQuery } from '../../hooks/use-queries';
import { BlockBoundary } from '../block-boundary';
import { MovesCard } from '../moves-card';
import { OrdersCard } from '../orders-card';
import { OwnSalesCard } from '../own-sales-card';
import { Shortcuts } from '../shortcuts';

import { ActivityBlockSkeleton } from './pieces/skeleton';

interface ActivityBlockProps {
  role: Role;
}

export function ActivityBlock({ role }: ActivityBlockProps) {
  const { data, isLoading, isError, refetch } = useRecentActivityQuery();

  if (role === 'sales') {
    return (
      <>
        <h2 className="text-[13px] font-bold tracking-wide uppercase">
          Atividade e atalhos
        </h2>
        <BlockBoundary
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          skeleton={<ActivityBlockSkeleton variant="simple" />}
        >
          <div className="flex flex-col gap-3">
            <OwnSalesCard sales={data?.ownRecentSales ?? []} />
            <Shortcuts role={role} variant="large" />
          </div>
        </BlockBoundary>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[13px] font-bold tracking-wide uppercase">
          Atividade e atalhos
        </h2>
        <Shortcuts role={role} />
      </div>
      <BlockBoundary
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        skeleton={<ActivityBlockSkeleton variant="full" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <MovesCard movements={data?.recentMovements ?? []} />
          <OrdersCard orders={data?.recentOrders ?? []} />
        </div>
      </BlockBoundary>
    </>
  );
}
