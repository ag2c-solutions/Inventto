import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MovementService } from '../../domain/services';

const mockUseUser = vi.fn();

vi.mock('../../domain/services', () => ({
  MovementService: {
    create: vi.fn()
  }
}));

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

import { useMovementCreateMutation } from './use-mutations';

describe('useMovementCreateMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ currentOrganization: { id: 'org-1' } });
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call MovementService.create with input + organization', async () => {
    vi.mocked(MovementService.create).mockResolvedValue('new-mov-id');

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useMovementCreateMutation(), {
      wrapper
    });

    const input = {
      type: 'entry' as const,
      reason: 'Compra' as const,
      executedAt: new Date('2023-10-02T08:00:00Z'),
      items: []
    };

    await result.current.mutateAsync(input);

    expect(MovementService.create).toHaveBeenCalledWith({
      input,
      organization: { id: 'org-1' }
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['movements'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] });
  });

  it('should throw when no organization is selected', async () => {
    mockUseUser.mockReturnValue({ currentOrganization: null });

    vi.mocked(MovementService.create).mockRejectedValue(
      new Error('Nenhuma organização selecionada.')
    );

    const { result } = renderHook(() => useMovementCreateMutation(), {
      wrapper
    });

    const executedAt = new Date('2023-10-02T08:00:00Z');

    await expect(
      result.current.mutateAsync({
        type: 'entry',
        reason: 'Outro',
        executedAt,
        items: []
      })
    ).rejects.toThrow('Nenhuma organização selecionada.');

    expect(MovementService.create).toHaveBeenCalledWith({
      input: { type: 'entry', reason: 'Outro', executedAt, items: [] },
      organization: null
    });
  });
});
