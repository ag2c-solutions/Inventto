import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { newOrderPayloadFactory } from '../../tests/factories/notification.factory';

import { NotificationsAPI } from '.';

const { mockSupabase, mockRpc, mockOn, mockSubscribe, mockChannel } =
  vi.hoisted(() => {
    const mockRpc = vi.fn();
    const mockSubscribe = vi.fn();
    const mockOn = vi.fn();
    const mockChannel = vi.fn();

    mockOn.mockReturnValue({ subscribe: mockSubscribe });
    mockChannel.mockReturnValue({ on: mockOn });

    return {
      mockSupabase: {
        rpc: mockRpc,
        channel: mockChannel
      },
      mockRpc,
      mockOn,
      mockSubscribe,
      mockChannel
    };
  });

vi.mock('@/infra/supabase', () => ({
  supabase: mockSupabase
}));

describe('NotificationsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOn.mockReturnValue({ subscribe: mockSubscribe });
    mockChannel.mockReturnValue({ on: mockOn });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getLowStockNotification', () => {
    it('should call the rpc and return the mapped notification', async () => {
      mockRpc.mockResolvedValue({ data: 3, error: null });

      const result = await NotificationsAPI.getLowStockNotification('org-1');

      expect(mockRpc).toHaveBeenCalledWith('get_low_stock_count', {
        p_organization_id: 'org-1'
      });
      expect(result?.message).toBe('Estoque baixo em 3 produtos.');
    });

    it('should return null when there is no low stock', async () => {
      mockRpc.mockResolvedValue({ data: 0, error: null });

      const result = await NotificationsAPI.getLowStockNotification('org-1');

      expect(result).toBeNull();
    });

    it('should throw a handled error when the rpc fails', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'boom', details: '' }
      });

      await expect(
        NotificationsAPI.getLowStockNotification('org-1')
      ).rejects.toThrow(
        'Erro ao executar getLowStockCount: Ocorreu um erro inesperado.'
      );
    });
  });

  describe('subscribeToOrders', () => {
    it('should subscribe to the orders realtime channel scoped by organization', () => {
      const onInsert = vi.fn();

      NotificationsAPI.subscribeToOrders('org-1', onInsert);

      expect(mockChannel).toHaveBeenCalledWith('orders_realtime');
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: 'organization_id=eq.org-1'
        },
        expect.any(Function)
      );
      expect(mockSubscribe).toHaveBeenCalledOnce();
    });

    it('should map the inserted payload and call onInsert', () => {
      const onInsert = vi.fn();
      const payload = newOrderPayloadFactory.build({ id: 'order-9' });

      NotificationsAPI.subscribeToOrders('org-1', onInsert);

      const onPostgresChanges = mockOn.mock.calls[0][2];
      onPostgresChanges({ new: payload });

      expect(onInsert).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'order-order-9', type: 'new-order' })
      );
    });
  });
});
