import type { Role } from '@/features/permissions';

import type { DashboardRoleView } from '../entities';

export class DashboardService {
  static getRoleView(role: Role): DashboardRoleView {
    return {
      role,
      showSalesChart: role !== 'sales',
      showOwnerExtras: role === 'owner'
    };
  }
}
