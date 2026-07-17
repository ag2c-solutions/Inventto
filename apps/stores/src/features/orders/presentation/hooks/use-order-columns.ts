import { useMemo } from 'react';

import type { Order, OrderMacroState } from '../../domain/entities';
import { OrderService } from '../../domain/services';

export interface OrderColumns {
  pool: Order[];
  attending: Order[];
  done: Order[];
  cancelled: Order[];
}

// RF034: agrupa por macro-estado; "Em atendimento" ordenada pela última
// ação (RN082). Extraído para hook porque o Kanban (lg+, OrdersBoard) e as
// Tabs (<lg, PED-06, OrderTabs) precisam do mesmo agrupamento — só muda a
// apresentação (colunas lado a lado x uma por vez).
export function useOrderColumns(orders: Order[]): OrderColumns {
  return useMemo(() => {
    const byMacro = (macro: OrderMacroState) =>
      orders.filter((order) => order.macroState === macro);

    return {
      pool: byMacro('pool'),
      attending: OrderService.sortByLastAction(byMacro('attending')),
      done: byMacro('done'),
      cancelled: byMacro('cancelled')
    };
  }, [orders]);
}
