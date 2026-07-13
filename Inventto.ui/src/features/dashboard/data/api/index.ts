import { supabase } from '@/infra/supabase';

import type {
  AttentionSummary,
  RecentActivity,
  SalesPeriod,
  SalesSummary
} from '../../domain/entities';
import type {
  AttentionSummaryDTO,
  RecentActivityDTO,
  SalesSummaryDTO
} from '../dtos';
import { handleDashboardError } from '../handlers/error-handler';
import {
  AttentionSummaryMapper,
  RecentActivityMapper,
  SalesSummaryMapper
} from '../mappers';

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

  static async getSalesSummary(
    organizationId: string,
    period: SalesPeriod
  ): Promise<SalesSummary> {
    try {
      const { data, error } = await supabase.rpc('get_sales_summary', {
        p_organization_id: organizationId,
        p_period: period
      });

      if (error) throw error;

      return SalesSummaryMapper.toDomain(data as SalesSummaryDTO);
    } catch (error) {
      handleDashboardError(error, 'getSalesSummary');
    }
  }

  static async getRecentActivity(
    organizationId: string
  ): Promise<RecentActivity> {
    try {
      const { data, error } = await supabase.rpc('get_recent_activity', {
        p_organization_id: organizationId
      });

      if (error) throw error;

      return RecentActivityMapper.toDomain(data as RecentActivityDTO);
    } catch (error) {
      handleDashboardError(error, 'getRecentActivity');
    }
  }
}
