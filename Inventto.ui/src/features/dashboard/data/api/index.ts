import { supabase } from '@/infra/supabase';

import type { AttentionSummary } from '../../domain/entities';
import type { AttentionSummaryDTO } from '../dtos';
import { handleDashboardError } from '../handlers/error-handler';
import { AttentionSummaryMapper } from '../mappers';

export class DashboardAPI {
  static async getAttentionSummary(
    organizationId: string
  ): Promise<AttentionSummary> {
    try {
      const { data, error } = await supabase.rpc('get_attention_summary', {
        p_organization_id: organizationId
      });

      if (error) throw error;

      return AttentionSummaryMapper.toDomain(data as AttentionSummaryDTO);
    } catch (error) {
      handleDashboardError(error, 'getAttentionSummary');
    }
  }
}
