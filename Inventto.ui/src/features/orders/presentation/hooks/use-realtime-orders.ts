import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { OrderApi } from '../../data/api';
import { ORDER_KEYS } from '../constants';

// Tempo que um pedido recém-chegado mantém a flag "Novo" + realce (RF035).
// Não há um valor definido pelo wireframe/RNs — escolha de bom senso.
const NEW_ORDER_HIGHLIGHT_MS = 60_000;

// RF035: assinatura em tempo real do painel.
// - INSERT (pedido novo no pool): marca o id como "novo" por um tempo, para
//   o card ganhar a flag "Novo" + realce (RF035).
// - UPDATE (avanço de esteira, expiração RN085, reconciliação de
//   concorrência RN082): só invalida a query — o board reconcilia sozinho
//   porque a coluna do card deriva de order.status.
export function useRealtimeOrders() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();
  const organizationId = currentOrganization?.id;
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const timeoutsRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    if (!organizationId) return;

    const timeouts = timeoutsRef.current;

    const unsubscribe = OrderApi.subscribeToChanges(
      organizationId,
      ({ eventType, new: newRow }) => {
        queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });

        if (eventType !== 'INSERT' || !newRow) return;

        const id = newRow.id;

        const existingTimeout = timeouts.get(id);
        if (existingTimeout) clearTimeout(existingTimeout);

        setNewOrderIds((prev) => new Set(prev).add(id));

        timeouts.set(
          id,
          setTimeout(() => {
            setNewOrderIds((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
            timeouts.delete(id);
          }, NEW_ORDER_HIGHLIGHT_MS)
        );
      }
    );

    return () => {
      unsubscribe();
      timeouts.forEach((timeout) => clearTimeout(timeout));
      timeouts.clear();
    };
  }, [organizationId, queryClient]);

  return { newOrderIds };
}
