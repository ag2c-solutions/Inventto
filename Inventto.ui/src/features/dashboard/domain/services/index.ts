import type { Role } from '@/features/permissions';

import type { DashboardRoleView } from '../entities';

const ACTIVITY_CARDS_BY_ROLE: Record<Role, string[]> = {
  owner: ['Movimentações recentes', 'Últimos pedidos'],
  manager: ['Movimentações recentes', 'Últimos pedidos'],
  sales: ['Suas últimas vendas']
};

export class DashboardService {
  static getRoleView(role: Role): DashboardRoleView {
    return {
      role,
      activityCards: ACTIVITY_CARDS_BY_ROLE[role],
      showSalesChart: role !== 'sales',
      showOwnerExtras: role === 'owner'
    };
  }
}
