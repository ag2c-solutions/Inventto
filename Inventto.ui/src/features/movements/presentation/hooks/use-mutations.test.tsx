import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MovementService } from '../../domain/services';

const mockUseUser = vi.fn(() => ({ organization: { id: 'org-1' } }));

vi.mock('../../domain/services', () => ({
  MovementService: {
    create: vi.fn()
  }
}));

vi.mock('@/features/users/hooks/use-user', () => ({
  useUser: () => mockUseUser()
}));

import { useMovementCreateMutation } from './use-mutations';

describe('useMovementCreateMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ organization: { id: 'org-1' } });
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call MovementService.create with input + organizationId', async () => {
    vi.mocked(MovementService.create).mockResolvedValue('new-mov-id');

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useMovementCreateMutation(), {
      wrapper
    });

    const input = {
      type: 'entry' as const,
      reason: 'Restock',
      items: []
    };

    await result.current.mutateAsync(input);

    expect(MovementService.create).toHaveBeenCalledWith({
      input,
      organizationId: 'org-1'
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['movements'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] });
  });

  it('should throw when no organization is selected', async () => {
    mockUseUser.mockReturnValue({ organization: null } as any);

    const { result } = renderHook(() => useMovementCreateMutation(), {
      wrapper
    });

    await expect(
      result.current.mutateAsync({
        type: 'entry',
        reason: 'Test',
        items: []
      })
    ).rejects.toThrow('Nenhuma organização selecionada.');
  });
});
