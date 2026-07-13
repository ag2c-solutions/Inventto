import type { AttentionSummary } from '../../domain/entities';
import type { AttentionSummaryDTO } from '../dtos';

export class AttentionSummaryMapper {
  static toDomain(dto: AttentionSummaryDTO): AttentionSummary {
    return {
      pendingOrders: dto.pending_orders,
      lowStock: dto.low_stock,
      expiringSoon: dto.expiring_soon
    };
  }
}
