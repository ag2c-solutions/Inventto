import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { OrderApi } from '../../data/api';
import { ORDER_KEYS } from '../constants';

// RF035: assinatura em tempo real do painel — qualquer INSERT/UPDATE em
// orders da organização invalida a query e o board reconcilia sozinho.
export function useRealtimeOrders() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();
  const organizationId = currentOrganization?.id;

  useEffect(() => {
    if (!organizationId) return;

    const unsubscribe = OrderApi.subscribeToChanges(organizationId, () => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
    });

    return unsubscribe;
  }, [organizationId, queryClient]);
}
