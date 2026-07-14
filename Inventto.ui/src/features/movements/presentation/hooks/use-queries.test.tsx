import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MovementService } from '../../domain/services';
import { movementFactory } from '../../tests/factories/movement.factory';

const mockUseUser = vi.fn();

vi.mock('../../domain/services', () => ({
  MovementService: {
    getAll: vi.fn()
  }
}));

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

import { useMovementsQuery } from './use-queries';

describe('useMovementsQuery', () => {
  let queryClient: QueryClient;
  const organization = { id: 'org-1' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({
      currentOrganization: organization,
      role: 'manager'
    });
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch via MovementService.getAll with organization, role and filters (MOV-08)', async () => {
    const mockMovements = movementFactory.buildList(1);

    vi.mocked(MovementService.getAll).mockResolvedValue(mockMovements);

    const { result } = renderHook(() => useMovementsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(MovementService.getAll).toHaveBeenCalledWith({
      organization,
      role: 'manager',
      productId: undefined
    });
    expect(result.current.data).toEqual(mockMovements);
  });

  it('should pass productId filter when provided', async () => {
    vi.mocked(MovementService.getAll).mockResolvedValue([]);

    const { result } = renderHook(
      () => useMovementsQuery({ productId: 'prod-123' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(MovementService.getAll).toHaveBeenCalledWith({
      organization,
      role: 'manager',
      productId: 'prod-123'
    });
  });

  it('should be disabled when no organization is selected', () => {
    mockUseUser.mockReturnValue({
      currentOrganization: null,
      role: 'manager'
    });

    const { result } = renderHook(() => useMovementsQuery(), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(MovementService.getAll).not.toHaveBeenCalled();
  });

  it('should be disabled while the role is not resolved (MOV-08)', () => {
    mockUseUser.mockReturnValue({
      currentOrganization: organization,
      role: undefined
    });

    const { result } = renderHook(() => useMovementsQuery(), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(MovementService.getAll).not.toHaveBeenCalled();
  });
});
