import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  OrderAlreadyClaimedError,
  OrderInvalidTransitionError
} from '../../domain/entities';
import { orderDTOFactory } from '../../tests/factories/order.factory';

import { OrderApi } from './index';

const { mockSupabase, mockOverrideTypes, mockEq, mockRpc, queryBuilder } =
  vi.hoisted(() => {
    const mockSelect = vi.fn();
    const mockOrder = vi.fn();
    const mockEq = vi.fn();
    const mockOverrideTypes = vi.fn();
    const mockRpc = vi.fn();

    const queryBuilder = {
      select: mockSelect,
      order: mockOrder,
      eq: mockEq,
      overrideTypes: mockOverrideTypes
    };

    mockSelect.mockReturnValue(queryBuilder);
    mockOrder.mockReturnValue(queryBuilder);
    mockEq.mockReturnValue(queryBuilder);

    const channelBuilder = { on: vi.fn(), subscribe: vi.fn() };
    channelBuilder.on.mockReturnValue(channelBuilder);
    channelBuilder.subscribe.mockReturnValue(channelBuilder);

    return {
      mockSupabase: {
        from: vi.fn(() => queryBuilder),
        rpc: mockRpc,
        channel: vi.fn(() => channelBuilder),
        removeChannel: vi.fn()
      },
      mockSelect,
      mockOrder,
      mockEq,
      mockOverrideTypes,
      mockRpc,
      queryBuilder
    };
  });

vi.mock('@/infra/supabase', () => ({
  supabase: mockSupabase
}));

describe('OrderApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockImplementation(() => queryBuilder);
  });

  const consoleErrorSpy = vi.spyOn(console, 'error');

  afterEach(() => {
    consoleErrorSpy.mockReset();
  });

  describe('getOrders', () => {
    it('should query "orders" filtered by organization and return mapped orders', async () => {
      const dto = orderDTOFactory.build({ organization_id: 'org-1' });
      mockOverrideTypes.mockResolvedValue({ data: [dto], error: null });

      const result = await OrderApi.getOrders('org-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('orders');
      expect(mockEq).toHaveBeenCalledWith('organization_id', 'org-1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(dto.id);
    });

    it('should throw handled error on database failure', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: 'Erro DB', code: 'PGRST000' }
      });

      await expect(OrderApi.getOrders('org-1')).rejects.toThrow(
        'Ocorreu um erro inesperado ao processar o pedido.'
      );
    });
  });

  describe('claimOrder', () => {
    it('should call the claim_order RPC', async () => {
      mockRpc.mockResolvedValue({ error: null });

      await expect(OrderApi.claimOrder('o1')).resolves.not.toThrow();

      expect(mockRpc).toHaveBeenCalledWith('claim_order', { p_id: 'o1' });
    });

    it('should map the ORDER_ALREADY_CLAIMED marker to OrderAlreadyClaimedError', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({
        error: { message: 'ORDER_ALREADY_CLAIMED' }
      });

      await expect(OrderApi.claimOrder('o1')).rejects.toBeInstanceOf(
        OrderAlreadyClaimedError
      );
    });

    it('should throw handled error for other RPC failures', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({ error: { message: 'DB Error' } });

      await expect(OrderApi.claimOrder('o1')).rejects.toThrow(
        'Ocorreu um erro inesperado ao processar o pedido.'
      );
    });
  });

  describe('advanceOrder', () => {
    it('should call the advance_order RPC', async () => {
      mockRpc.mockResolvedValue({ error: null });

      await expect(OrderApi.advanceOrder('o1')).resolves.not.toThrow();

      expect(mockRpc).toHaveBeenCalledWith('advance_order', { p_id: 'o1' });
    });

    it('should map the ORDER_INVALID_TRANSITION marker to OrderInvalidTransitionError', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({
        error: { message: 'ORDER_INVALID_TRANSITION' }
      });

      await expect(OrderApi.advanceOrder('o1')).rejects.toBeInstanceOf(
        OrderInvalidTransitionError
      );
    });
  });

  describe('finalizeOrder', () => {
    it('should call the finalize_order RPC', async () => {
      mockRpc.mockResolvedValue({ error: null });

      await expect(OrderApi.finalizeOrder('o1')).resolves.not.toThrow();

      expect(mockRpc).toHaveBeenCalledWith('finalize_order', { p_id: 'o1' });
    });

    it('should map the ORDER_INVALID_TRANSITION marker to OrderInvalidTransitionError', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({
        error: { message: 'ORDER_INVALID_TRANSITION' }
      });

      await expect(OrderApi.finalizeOrder('o1')).rejects.toBeInstanceOf(
        OrderInvalidTransitionError
      );
    });
  });

  describe('cancelOrder', () => {
    it('should call the cancel_order RPC with the reason', async () => {
      mockRpc.mockResolvedValue({ error: null });

      await expect(
        OrderApi.cancelOrder('o1', 'Cliente desistiu')
      ).resolves.not.toThrow();

      expect(mockRpc).toHaveBeenCalledWith('cancel_order', {
        p_id: 'o1',
        p_reason: 'Cliente desistiu'
      });
    });

    it('should throw handled error when the RPC fails', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({ error: { message: 'DB Error' } });

      await expect(OrderApi.cancelOrder('o1', 'Motivo')).rejects.toThrow(
        'Ocorreu um erro inesperado ao processar o pedido.'
      );
    });
  });

  describe('subscribeToChanges', () => {
    it('should return an unsubscribe function', () => {
      const unsubscribe = OrderApi.subscribeToChanges('org-1', vi.fn());

      expect(typeof unsubscribe).toBe('function');
    });
  });
});
