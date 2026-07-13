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

// RF037/DASH-03 · período do bloco "Resumo de vendas" — superset decidido
// pelo usuário: Hoje/7/30 dias (wireframe) + 90 dias (spec RF037).
export type SalesPeriod = 'today' | '7d' | '30d' | '90d';

export interface SalesSeriesPoint {
  date: string;
  pos: number;
  online: number;
}

export interface OwnSalesToday {
  count: number;
  total: number;
}

// RF037/DASH-03 · bloco "Resumo de vendas". Campos ausentes = recorte por
// papel (RN091), reforçado no servidor (get_sales_summary): Sales recebe
// só `ownSalesToday`; `inventoryAtCost`/`avgMargin` são exclusivos do Owner.
export interface SalesSummary {
  revenueTotal?: number;
  salesCount?: number;
  series?: SalesSeriesPoint[];
  trend?: number;
  inventoryAtCost?: number;
  avgMargin?: number;
  ownSalesToday?: OwnSalesToday;
}
