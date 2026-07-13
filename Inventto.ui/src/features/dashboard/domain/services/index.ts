import type { Role } from '@/features/permissions';

import type { DashboardRoleView } from '../entities';

const ATTENTION_CARDS_BY_ROLE: Record<Role, string[]> = {
  owner: [
    'Pedidos pendentes',
    'Estoque crítico ou zerado',
    'Expirando em breve'
  ],
  manager: [
    'Pedidos pendentes',
    'Estoque crítico ou zerado',
    'Expirando em breve'
  ],
  sales: ['Pedidos do pool perto de expirar']
};

const ACTIVITY_CARDS_BY_ROLE: Record<Role, string[]> = {
  owner: ['Movimentações recentes', 'Últimos pedidos'],
  manager: ['Movimentações recentes', 'Últimos pedidos'],
  sales: ['Suas últimas vendas']
};

export class DashboardService {
  static getRoleView(role: Role): DashboardRoleView {
    return {
      role,
      attentionCards: ATTENTION_CARDS_BY_ROLE[role],
      activityCards: ACTIVITY_CARDS_BY_ROLE[role],
      showSalesChart: role !== 'sales',
      showOwnerExtras: role === 'owner'
    };
  }
}
