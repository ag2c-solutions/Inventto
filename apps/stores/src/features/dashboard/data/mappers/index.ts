import type {
  AttentionSummary,
  OnboardingStatus,
  RecentActivity,
  SalesSummary
} from '../../domain/entities';
import type {
  AttentionSummaryDTO,
  OnboardingStatusDTO,
  RecentActivityDTO,
  SalesSummaryDTO
} from '../dtos';

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

export class RecentActivityMapper {
  static toDomain(dto: RecentActivityDTO): RecentActivity {
    return {
      recentMovements: dto.recent_movements?.map((movement) => ({
        id: movement.id,
        type: movement.type,
        reason: movement.reason ?? 'Sem motivo',
        totalQuantity: movement.total_quantity,
        itemsCount: movement.items_count,
        executedAt: new Date(movement.executed_at)
      })),
      recentOrders: dto.recent_orders?.map((order) => ({
        id: order.id,
        code: order.code,
        customerName: order.customer_name ?? undefined,
        status: order.status,
        total: order.total,
        updatedAt: new Date(order.updated_at)
      })),
      ownRecentSales: dto.own_recent_sales?.map((sale) => ({
        id: sale.id,
        code: sale.code,
        itemsCount: sale.items_count,
        total: sale.total,
        updatedAt: new Date(sale.updated_at)
      }))
    };
  }
}

export class OnboardingStatusMapper {
  static toDomain(dto: OnboardingStatusDTO): OnboardingStatus {
    return {
      hasProducts: dto.has_products,
      hasCatalog: dto.has_catalog,
      hasPublishedStorefront: dto.has_published_storefront,
      hasSales: dto.has_sales
    };
  }
}
