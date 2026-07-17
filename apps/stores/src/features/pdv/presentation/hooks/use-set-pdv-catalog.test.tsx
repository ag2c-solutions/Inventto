import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PdvService } from '../../domain/services';

import { useSetPdvCatalogMutation } from './use-set-pdv-catalog';

vi.mock('../../domain/services', () => ({
  PdvService: {
    setPdvCatalog: vi.fn()
  }
}));

const { mockUseUser } = vi.hoisted(() => ({ mockUseUser: vi.fn() }));

vi.mock('@/features/users', () => ({
  useUser: mockUseUser
}));

describe('useSetPdvCatalogMutation', () => {
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

  it('should call PdvService.setPdvCatalog and invalidate the pdv catalog query', async () => {
    vi.mocked(PdvService.setPdvCatalog).mockResolvedValue(undefined);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSetPdvCatalogMutation(), {
      wrapper
    });

    await result.current.mutateAsync('cat-1');

    expect(PdvService.setPdvCatalog).toHaveBeenCalledWith('cat-1');
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['pdv', 'catalog', 'org-1']
    });
  });

  it('should propagate errors without a local onError (handled by MutationCache)', async () => {
    vi.mocked(PdvService.setPdvCatalog).mockRejectedValue(
      new Error('Acesso negado.')
    );

    const { result } = renderHook(() => useSetPdvCatalogMutation(), {
      wrapper
    });

    await expect(result.current.mutateAsync('cat-1')).rejects.toThrow(
      'Acesso negado.'
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
