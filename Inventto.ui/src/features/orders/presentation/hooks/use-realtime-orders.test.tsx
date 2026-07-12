import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { OrderChangePayload } from '../../data/api';
import { OrderApi } from '../../data/api';

import { useRealtimeOrders } from './use-realtime-orders';

vi.mock('../../data/api', () => ({
  OrderApi: {
    subscribeToChanges: vi.fn()
  }
}));

const { mockUseUser } = vi.hoisted(() => ({ mockUseUser: vi.fn() }));

vi.mock('@/features/users', () => ({
  useUser: mockUseUser
}));

describe('useRealtimeOrders', () => {
  let queryClient: QueryClient;
  let emit: (payload: OrderChangePayload) => void;
  const unsubscribe = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockUseUser.mockReturnValue({ currentOrganization: { id: 'org-1' } });
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    vi.mocked(OrderApi.subscribeToChanges).mockImplementation(
      (_organizationId, onChange) => {
        emit = onChange;
        return unsubscribe;
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should subscribe for the current organization', () => {
    renderHook(() => useRealtimeOrders(), { wrapper });

    expect(OrderApi.subscribeToChanges).toHaveBeenCalledWith(
      'org-1',
      expect.any(Function)
    );
  });

  it('should invalidate the orders list on any change', () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    renderHook(() => useRealtimeOrders(), { wrapper });

    act(() => {
      emit({
        eventType: 'UPDATE',
        new: { id: 'o1', status: 'confirming', seller_id: 'seller-1' },
        old: { status: 'pending' }
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['orders'] });
  });

  it('should mark a freshly inserted order as new', () => {
    const { result } = renderHook(() => useRealtimeOrders(), { wrapper });

    act(() => {
      emit({
        eventType: 'INSERT',
        new: { id: 'o1', status: 'pending', seller_id: null },
        old: null
      });
    });

    expect(result.current.newOrderIds.has('o1')).toBe(true);
  });

  it('should not mark updates or deletes as new', () => {
    const { result } = renderHook(() => useRealtimeOrders(), { wrapper });

    act(() => {
      emit({
        eventType: 'UPDATE',
        new: { id: 'o1', status: 'confirming', seller_id: 'seller-1' },
        old: { status: 'pending' }
      });
    });

    expect(result.current.newOrderIds.has('o1')).toBe(false);
  });

  it('should clear the new flag after the highlight window', () => {
    const { result } = renderHook(() => useRealtimeOrders(), { wrapper });

    act(() => {
      emit({
        eventType: 'INSERT',
        new: { id: 'o1', status: 'pending', seller_id: null },
        old: null
      });
    });
    expect(result.current.newOrderIds.has('o1')).toBe(true);

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(result.current.newOrderIds.has('o1')).toBe(false);
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = renderHook(() => useRealtimeOrders(), { wrapper });

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('should not subscribe without a current organization', () => {
    mockUseUser.mockReturnValue({ currentOrganization: null });

    renderHook(() => useRealtimeOrders(), { wrapper });

    expect(OrderApi.subscribeToChanges).not.toHaveBeenCalled();
  });
});
