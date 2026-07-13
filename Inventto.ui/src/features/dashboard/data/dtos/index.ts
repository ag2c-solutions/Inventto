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
