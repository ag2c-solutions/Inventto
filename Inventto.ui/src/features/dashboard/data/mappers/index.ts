import type { AttentionSummary, SalesSummary } from '../../domain/entities';
import type { AttentionSummaryDTO, SalesSummaryDTO } from '../dtos';

export class AttentionSummaryMapper {
  static toDomain(dto: AttentionSummaryDTO): AttentionSummary {
    return {
      pendingOrders: dto.pending_orders,
      lowStock: dto.low_stock,
      expiringSoon: dto.expiring_soon
    };
  }
}

export class SalesSummaryMapper {
  static toDomain(dto: SalesSummaryDTO): SalesSummary {
    return {
      revenueTotal: dto.revenue_total,
      salesCount: dto.sales_count,
      series: dto.series?.map((point) => ({
        date: point.date,
        pos: point.pos,
        online: point.online
      })),
      trend: dto.trend,
      inventoryAtCost: dto.inventory_at_cost,
      avgMargin: dto.avg_margin,
      ownSalesToday: dto.own_sales_today
        ? {
            count: dto.own_sales_today.count,
            total: dto.own_sales_today.total
          }
        : undefined
    };
  }
}
