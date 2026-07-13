import { describe, expect, it, vi } from 'vitest';

import { attentionSummaryDTOFactory } from '../../tests/factories/attention-summary.factory';
import { salesSummaryDTOFactory } from '../../tests/factories/sales-summary.factory';

import { DashboardAPI } from '.';

const { mockSupabase, mockRpc } = vi.hoisted(() => {
  const mockRpc = vi.fn();

  return {
    mockSupabase: { rpc: mockRpc },
    mockRpc
  };
});

vi.mock('@/infra/supabase', () => ({
  supabase: mockSupabase
}));

describe('DashboardAPI', () => {
  describe('getAttentionSummary', () => {
    it('should call the rpc with the organization id and return the mapped summary', async () => {
      const dto = attentionSummaryDTOFactory.build({
        pending_orders: 5,
        low_stock: 3,
        expiring_soon: 2
      });
      mockRpc.mockResolvedValue({ data: dto, error: null });

      const result = await DashboardAPI.getAttentionSummary('org-1');

      expect(mockRpc).toHaveBeenCalledWith('get_attention_summary', {
        p_organization_id: 'org-1'
      });
      expect(result).toEqual({
        pendingOrders: 5,
        lowStock: 3,
        expiringSoon: 2
      });
    });

    it('should throw a handled error when the rpc fails', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'boom', details: '' }
      });

      await expect(DashboardAPI.getAttentionSummary('org-1')).rejects.toThrow(
        'Erro ao executar getAttentionSummary: Ocorreu um erro inesperado ao carregar o dashboard.'
      );
    });
  });

  describe('getSalesSummary', () => {
    it('should call the rpc with the organization id and period, and return the mapped summary', async () => {
      const dto = salesSummaryDTOFactory.build({
        revenue_total: 1198.2,
        sales_count: 5
      });
      mockRpc.mockResolvedValue({ data: dto, error: null });

      const result = await DashboardAPI.getSalesSummary('org-1', '30d');

      expect(mockRpc).toHaveBeenCalledWith('get_sales_summary', {
        p_organization_id: 'org-1',
        p_period: '30d'
      });
      expect(result.revenueTotal).toBe(1198.2);
      expect(result.salesCount).toBe(5);
    });

    it('should throw a handled error when the rpc fails', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'boom', details: '' }
      });

      await expect(
        DashboardAPI.getSalesSummary('org-1', '30d')
      ).rejects.toThrow(
        'Erro ao executar getSalesSummary: Ocorreu um erro inesperado ao carregar o dashboard.'
      );
    });
  });
});
