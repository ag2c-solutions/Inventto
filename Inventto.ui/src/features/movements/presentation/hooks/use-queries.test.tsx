import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MovementApi } from '../../data/api';
import type { Movement } from '../../domain/entities';

const mockUseUser = vi.fn();

vi.mock('../../data/api', () => ({
  MovementApi: {
    getAll: vi.fn()
  }
}));

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

import { useMovementsQuery } from './use-queries';

describe('useMovementsQuery', () => {
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

  it('should fetch movements using MovementApi.getAll with organizationId', async () => {
    const mockMovements: Movement[] = [
      {
        id: 'mov-1',
        organizationId: 'org-1',
        type: 'entry',
        reason: 'Compra',
        createdAt: new Date(),
        executedAt: new Date(),
        totalQuantity: 10,
        totalValue: 100,
        items: []
      }
    ];

    vi.mocked(MovementApi.getAll).mockResolvedValue(mockMovements);

    const { result } = renderHook(() => useMovementsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(MovementApi.getAll).toHaveBeenCalledWith({
      organizationId: 'org-1',
      productId: undefined
    });
    expect(result.current.data).toEqual(mockMovements);
  });

  it('should pass productId filter when provided', async () => {
    vi.mocked(MovementApi.getAll).mockResolvedValue([]);

    const { result } = renderHook(
      () => useMovementsQuery({ productId: 'prod-123' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(MovementApi.getAll).toHaveBeenCalledWith({
      organizationId: 'org-1',
      productId: 'prod-123'
    });
  });

  it('should be disabled when no organization is selected', () => {
    mockUseUser.mockReturnValue({ currentOrganization: null });

    const { result } = renderHook(() => useMovementsQuery(), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(MovementApi.getAll).not.toHaveBeenCalled();
  });
});
