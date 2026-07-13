import { useQuery } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { DashboardAPI } from '../../data/api';

export const useAttentionSummaryQuery = () => {
  const { currentOrganization } = useUser();
  const organizationId = currentOrganization?.id;

  return useQuery({
    queryKey: ['dashboard', 'attention-summary', organizationId],
    queryFn: () => DashboardAPI.getAttentionSummary(organizationId as string),
    enabled: !!organizationId
  });
};
