import { TrendingDown, TrendingUp } from 'lucide-react';

import { cn } from '@/shared/utils';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import type { Role } from '@/features/permissions';

import { DashboardService } from '../../../domain/services';
import { useSalesSummaryQuery } from '../../hooks/use-queries';
import { BlockBoundary } from '../block-boundary';
import { OwnerExtras } from '../owner-extras';
import { PeriodSegmented } from '../period-segmented';
import { SalesChart } from '../sales-chart';
import { SalesSimple } from '../sales-simple';

import { usePeriod } from './hooks/use-period';
import { SalesBlockSkeleton } from './pieces/skeleton';

interface SalesBlockProps {
  role: Role;
}

export function SalesBlock({ role }: SalesBlockProps) {
  const view = DashboardService.getRoleView(role);
  const { period, setPeriod } = usePeriod();
  const { data, isLoading, isError, refetch } = useSalesSummaryQuery(period);

  if (!view.showSalesChart) {
    return (
      <BlockBoundary
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        skeleton={<SalesBlockSkeleton variant="simple" />}
      >
        <SalesSimple ownSalesToday={data?.ownSalesToday} />
      </BlockBoundary>
    );
  }

  const trend = data?.trend ?? 0;
  const TrendIcon = trend < 0 ? TrendingDown : TrendingUp;

  return (
    <BlockBoundary
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      skeleton={<SalesBlockSkeleton variant="chart" />}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {formatCurrency(data?.revenueTotal) ?? 'R$ 0,00'}
            </span>
            <span
              className={cn(
                'flex items-center gap-1 text-sm font-medium',
                trend < 0
                  ? 'text-[var(--status-critical)]'
                  : 'text-[var(--status-healthy)]'
              )}
            >
              <TrendIcon className="size-4" />
              {trend > 0 ? '+' : ''}
              {trend}%
            </span>
          </div>
          <PeriodSegmented value={period} onChange={setPeriod} />
        </div>

        <p className="text-sm text-muted-foreground">
          Faturamento total do período ·{' '}
          <strong className="font-semibold text-foreground">
            {data?.salesCount ?? 0}
          </strong>{' '}
          vendas (balcão + pedidos confirmados)
        </p>

        <SalesChart series={data?.series ?? []} period={period} />

        <OwnerExtras
          role={role}
          inventoryAtCost={data?.inventoryAtCost}
          avgMargin={data?.avgMargin}
        />
      </div>
    </BlockBoundary>
  );
}
