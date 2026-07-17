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

// PED-04: Sheet de atendimento (/pedidos/:id). Não há erro dedicado de
// 404/sem permissão — getOrder já converge as duas situações no mesmo
// "sem linha" (RLS filtra silenciosamente), então a Sheet trata
// !isLoading && !data como o estado "não encontrado" (sem toast).
// queryFn coage undefined -> null: o React Query v5 trata um retorno
// undefined como estado inválido (a query nunca chega a "success").
export function useOrderQuery(id?: string) {
  return useQuery({
    queryKey: ORDER_KEYS.detail(id),
    queryFn: async () => (await OrderApi.getOrder(id!)) ?? null,
    enabled: !!id
  });
}
