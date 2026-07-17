import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrderApi } from '../../data/api';
import { orderFactory } from '../../tests/factories/order.factory';

import { useOrderQuery, useOrdersQuery } from './use-queries';

vi.mock('../../data/api', () => ({
  OrderApi: {
    getOrders: vi.fn(),
    getOrder: vi.fn()
  }
}));

const { mockUseUser } = vi.hoisted(() => ({ mockUseUser: vi.fn() }));

vi.mock('@/features/users', () => ({
  useUser: mockUseUser
}));

describe('useOrdersQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ currentOrganization: { id: 'org-1' } });
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch orders for the current organization', async () => {
    const orders = orderFactory.buildList(2);
    vi.mocked(OrderApi.getOrders).mockResolvedValue(orders);

    const { result } = renderHook(() => useOrdersQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(OrderApi.getOrders).toHaveBeenCalledWith('org-1');
    expect(result.current.data).toEqual(orders);
  });

  it('should not execute the query without a current organization', async () => {
    mockUseUser.mockReturnValue({ currentOrganization: null });

    const { result } = renderHook(() => useOrdersQuery(), { wrapper });

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));

    expect(OrderApi.getOrders).not.toHaveBeenCalled();
  });

  it('should filter the returned orders by search', async () => {
    const orders = [
      orderFactory.build({ customerName: 'Joana Silva' }),
      orderFactory.build({ customerName: 'Marcos Reis' })
    ];
    vi.mocked(OrderApi.getOrders).mockResolvedValue(orders);

    const { result } = renderHook(() => useOrdersQuery({ search: 'joana' }), {
      wrapper
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].customerName).toBe('Joana Silva');
  });

  it('should filter the returned orders by seller (role scoping already applied server-side)', async () => {
    const orders = [
      orderFactory.build({ sellerId: 'seller-1' }),
      orderFactory.build({ sellerId: 'seller-2' })
    ];
    vi.mocked(OrderApi.getOrders).mockResolvedValue(orders);

    const { result } = renderHook(
      () => useOrdersQuery({ sellerId: 'seller-1' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].sellerId).toBe('seller-1');
  });
});

describe('useOrderQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch the order by id', async () => {
    const order = orderFactory.build({ id: 'o1' });
    vi.mocked(OrderApi.getOrder).mockResolvedValue(order);

    const { result } = renderHook(() => useOrderQuery('o1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(OrderApi.getOrder).toHaveBeenCalledWith('o1');
    expect(result.current.data).toEqual(order);
  });

  it('should not execute the query without an id', async () => {
    const { result } = renderHook(() => useOrderQuery(undefined), {
      wrapper
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));

    expect(OrderApi.getOrder).not.toHaveBeenCalled();
  });

  it('should resolve to null for 404/sem permissão (no toast, treated as data)', async () => {
    vi.mocked(OrderApi.getOrder).mockResolvedValue(undefined);

    const { result } = renderHook(() => useOrderQuery('missing'), {
      wrapper
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });
});
