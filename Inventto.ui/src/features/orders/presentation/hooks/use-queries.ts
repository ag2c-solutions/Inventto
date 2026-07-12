import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { OrderApi } from '../../data/api';
import type { OrderFilters } from '../../domain/entities';
import { OrderService } from '../../domain/services';
import { ORDER_KEYS } from '../constants';

export function useOrdersQuery(filters: OrderFilters = {}) {
  const { currentOrganization } = useUser();

  const query = useQuery({
    queryKey: [...ORDER_KEYS.all, currentOrganization?.id],
    queryFn: () => OrderApi.getOrders(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
    staleTime: 1000 * 30
  });

  const data = useMemo(
    () => OrderService.filterOrders(query.data ?? [], filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query.data, filters.search, filters.period, filters.sellerId]
  );

  return { ...query, data };
}
