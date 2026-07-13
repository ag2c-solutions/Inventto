import type { Role } from '@/features/permissions';

export interface DashboardRoleView {
  role: Role;
  attentionCards: string[];
  activityCards: string[];
  showSalesChart: boolean;
  showOwnerExtras: boolean;
}
