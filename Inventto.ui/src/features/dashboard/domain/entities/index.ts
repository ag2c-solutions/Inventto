import type { Role } from '@/features/permissions';

export interface DashboardRoleView {
  role: Role;
  activityCards: string[];
  showSalesChart: boolean;
  showOwnerExtras: boolean;
}

// RF036/DASH-02 · bloco "Atenção imediata". Campos ausentes = recorte por
// papel (RN091), reforçado no servidor (get_attention_summary): Sales só
// recebe `expiringSoon`.
export interface AttentionSummary {
  pendingOrders?: number;
  lowStock?: number;
  expiringSoon: number;
}
