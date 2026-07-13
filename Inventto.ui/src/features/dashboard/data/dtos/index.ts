export interface AttentionSummaryDTO {
  pending_orders?: number;
  low_stock?: number;
  expiring_soon: number;
}

export interface SalesSeriesPointDTO {
  date: string;
  pos: number;
  online: number;
}

export interface OwnSalesTodayDTO {
  count: number;
  total: number;
}

export interface SalesSummaryDTO {
  revenue_total?: number;
  sales_count?: number;
  series?: SalesSeriesPointDTO[];
  trend?: number;
  inventory_at_cost?: number;
  avg_margin?: number;
  own_sales_today?: OwnSalesTodayDTO;
}

export interface RecentMovementDTO {
  id: string;
  type: 'entry' | 'withdrawal';
  reason: string | null;
  total_quantity: number;
  items_count: number;
  executed_at: string;
}

export interface RecentOrderDTO {
  id: string;
  code: string;
  customer_name: string | null;
  status: string;
  total: number;
  updated_at: string;
}

export interface OwnRecentSaleDTO {
  id: string;
  code: string;
  items_count: number;
  total: number;
  updated_at: string;
}

export interface RecentActivityDTO {
  recent_movements?: RecentMovementDTO[];
  recent_orders?: RecentOrderDTO[];
  own_recent_sales?: OwnRecentSaleDTO[];
}
