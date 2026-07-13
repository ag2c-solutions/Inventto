import { useQuery } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { DashboardAPI } from '../../data/api';
import type { SalesPeriod } from '../../domain/entities';

export const useAttentionSummaryQuery = () => {
  const { currentOrganization } = useUser();
  const organizationId = currentOrganization?.id;

  return useQuery({
    queryKey: ['dashboard', 'attention-summary', organizationId],
    queryFn: () => DashboardAPI.getAttentionSummary(organizationId as string),
    enabled: !!organizationId
  });
};

export const useSalesSummaryQuery = (period: SalesPeriod) => {
  const { currentOrganization } = useUser();
  const organizationId = currentOrganization?.id;

  return useQuery({
    queryKey: ['dashboard', 'sales-summary', organizationId, period],
    queryFn: () =>
      DashboardAPI.getSalesSummary(organizationId as string, period),
    enabled: !!organizationId
  });
};
