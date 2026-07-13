import { describe, expect, it, vi } from 'vitest';

import { attentionSummaryDTOFactory } from '../../tests/factories/attention-summary.factory';

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
});
