import type { Role } from '@/features/permissions';

export interface DashboardRoleView {
  role: Role;
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

// RF038/DASH-04 · bloco "Atividade e atalhos" — mini-listas independentes
// das entidades públicas de movements/orders (evita acoplar o dashboard ao
// shape completo dessas features; só o necessário para a mini-lista).
export interface RecentMovement {
  id: string;
  type: 'entry' | 'withdrawal';
  reason: string;
  totalQuantity: number;
  itemsCount: number;
  executedAt: Date;
}

export interface RecentOrder {
  id: string;
  code: string;
  customerName?: string;
  status: string;
  total: number;
  updatedAt: Date;
}

export interface OwnRecentSale {
  id: string;
  code: string;
  itemsCount: number;
  total: number;
  updatedAt: Date;
}

// Campos ausentes = recorte por papel (RN091), reforçado no servidor
// (get_recent_activity): Sales recebe só `ownRecentSales`.
export interface RecentActivity {
  recentMovements?: RecentMovement[];
  recentOrders?: RecentOrder[];
  ownRecentSales?: OwnRecentSale[];
}

// RN092/DASH-05 · estado real da org usado pra decidir onboarding × blocos
// operacionais e a progressão dos 3 passos. `hasCatalog` exige catálogo com
// ao menos 1 item (ver get_onboarding_status) — "definir o que você vende e
// por quanto" não é satisfeito por um catálogo vazio.
export interface OnboardingStatus {
  hasProducts: boolean;
  hasCatalog: boolean;
  hasPublishedStorefront: boolean;
  hasSales: boolean;
}

export type OnboardingStepId = 'product' | 'catalog' | 'storefront';

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  subtitle: string;
  href: string;
  done: boolean;
  active: boolean;
}
