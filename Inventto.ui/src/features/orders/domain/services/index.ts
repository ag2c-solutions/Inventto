import { OrderApi } from '../../data/api';
import {
  type Order,
  type OrderFilters,
  OrderInvalidTransitionError,
  type OrderMacroState,
  type OrderMicroState
} from '../entities';

const PERIOD_IN_DAYS: Record<string, number> = {
  today: 1,
  '7d': 7,
  '30d': 30,
  '90d': 90
};

const MACRO_STATE_BY_MICRO_STATE: Record<OrderMicroState, OrderMacroState> = {
  pending: 'pool',
  confirming: 'attending',
  picking: 'attending',
  delivering: 'attending',
  confirmed: 'done',
  cancelled: 'cancelled',
  expired: 'cancelled'
};

// Esteira: de cada micro-estado só cabe avançar para o próximo (RN087 —
// baixa de estoque só no passo terminal "Finalizar").
const NEXT_MICRO_STATE: Partial<Record<OrderMicroState, OrderMicroState>> = {
  confirming: 'picking',
  picking: 'delivering',
  delivering: 'confirmed'
};

const CANCELLABLE_STATES: OrderMicroState[] = [
  'pending',
  'confirming',
  'picking',
  'delivering'
];

export class OrderService {
  static deriveMacroState(microState: OrderMicroState): OrderMacroState {
    return MACRO_STATE_BY_MICRO_STATE[microState];
  }

  static getNextMicroState(
    microState: OrderMicroState
  ): OrderMicroState | undefined {
    return NEXT_MICRO_STATE[microState];
  }

  static canCancel(microState: OrderMicroState): boolean {
    return CANCELLABLE_STATES.includes(microState);
  }

  static async claim(id: string): Promise<void> {
    return OrderApi.claimOrder(id);
  }

  // Avança para o estágio seguinte; finalize_order (RN087) é chamado
  // separadamente quando o pedido já está em "delivering" (último passo
  // consome a reserva e gera a saída — ver finalize abaixo).
  static async advance(id: string, microState: OrderMicroState): Promise<void> {
    const next = this.getNextMicroState(microState);

    if (!next) {
      throw new OrderInvalidTransitionError();
    }

    if (next === 'confirmed') {
      return OrderApi.finalizeOrder(id);
    }

    return OrderApi.advanceOrder(id);
  }

  static async cancel(
    id: string,
    microState: OrderMicroState,
    reason: string
  ): Promise<void> {
    if (!this.canCancel(microState)) {
      throw new OrderInvalidTransitionError();
    }

    return OrderApi.cancelOrder(id, reason);
  }

  // Filtros do painel (busca/período/vendedor) aplicados sobre a lista já
  // recortada por papel via RLS — RN082/RN088 (Sales só recebe pool +
  // próprios do servidor; aqui é só refinamento local).
  static filterOrders(orders: Order[], filters: OrderFilters): Order[] {
    const search = filters.search?.trim().toLowerCase();
    const days = filters.period ? PERIOD_IN_DAYS[filters.period] : undefined;
    const since = days
      ? new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      : undefined;

    return orders.filter((order) => {
      if (search) {
        const matches =
          order.customerName?.toLowerCase().includes(search) ||
          order.customerPhone?.toLowerCase().includes(search);
        if (!matches) return false;
      }

      if (since && order.receivedAt < since) return false;

      if (filters.sellerId && order.sellerId !== filters.sellerId) {
        return false;
      }

      return true;
    });
  }

  // RF034: "Em atendimento" ordenado pela última ação (mais recente primeiro).
  static sortByLastAction(orders: Order[]): Order[] {
    return [...orders].sort(
      (a, b) => b.lastActionAt.getTime() - a.lastActionAt.getTime()
    );
  }
}
