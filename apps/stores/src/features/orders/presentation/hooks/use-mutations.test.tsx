import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrderService } from '../../domain/services';

import {
  useAdvanceOrderMutation,
  useCancelOrderMutation,
  useClaimOrderMutation,
  useFinalizeOrderMutation
} from './use-mutations';

vi.mock('../../domain/services', () => ({
  OrderService: {
    claim: vi.fn(),
    advance: vi.fn(),
    finalize: vi.fn(),
    cancel: vi.fn()
  }
}));

describe('orders mutations', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useClaimOrderMutation', () => {
    it('should call OrderService.claim and invalidate the orders list', async () => {
      vi.mocked(OrderService.claim).mockResolvedValue(undefined);
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useClaimOrderMutation(), {
        wrapper
      });

      result.current.mutate('o1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(OrderService.claim).toHaveBeenCalledWith('o1');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['orders'] });
    });

    it('should reconcile the board (invalidate the list) when another seller already claimed it (RN082)', async () => {
      vi.mocked(OrderService.claim).mockRejectedValue(
        new Error('Este pedido já foi assumido por outro vendedor.')
      );
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useClaimOrderMutation(), {
        wrapper
      });

      result.current.mutate('o1');

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['orders'] });
    });
  });

  describe('useAdvanceOrderMutation', () => {
    it('should call OrderService.advance and invalidate the orders list', async () => {
      vi.mocked(OrderService.advance).mockResolvedValue(undefined);
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useAdvanceOrderMutation(), {
        wrapper
      });

      result.current.mutate({ id: 'o1', microState: 'confirming' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(OrderService.advance).toHaveBeenCalledWith('o1', 'confirming');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['orders'] });
    });
  });

  describe('useFinalizeOrderMutation', () => {
    it('should call OrderService.finalize and invalidate the orders list', async () => {
      vi.mocked(OrderService.finalize).mockResolvedValue(undefined);
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useFinalizeOrderMutation(), {
        wrapper
      });

      result.current.mutate({ id: 'o1', microState: 'delivering' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(OrderService.finalize).toHaveBeenCalledWith('o1', 'delivering');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['orders'] });
    });
  });

  describe('useCancelOrderMutation', () => {
    it('should call OrderService.cancel and invalidate the orders list', async () => {
      vi.mocked(OrderService.cancel).mockResolvedValue(undefined);
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCancelOrderMutation(), {
        wrapper
      });

      result.current.mutate({
        id: 'o1',
        microState: 'picking',
        reason: 'Cliente desistiu'
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(OrderService.cancel).toHaveBeenCalledWith(
        'o1',
        'picking',
        'Cliente desistiu'
      );
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['orders'] });
    });
  });
});
