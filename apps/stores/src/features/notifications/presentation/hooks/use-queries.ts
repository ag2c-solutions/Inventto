import { useQuery } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { NotificationsService } from '../../domain/services';

export const useLowStockQuery = () => {
  const { currentOrganization } = useUser();

  const organizationId = currentOrganization?.id;

  return useQuery({
    queryKey: ['notifications', 'low-stock', organizationId],

    queryFn: () => {
      return NotificationsService.getLowStockNotification(organizationId);
    },
    enabled: !!organizationId
  });
};
