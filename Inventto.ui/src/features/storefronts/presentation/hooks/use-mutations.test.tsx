import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StorefrontService } from '../../domain/services';

import { useUnpublishStorefrontMutation } from './use-mutations';

vi.mock('../../domain/services', () => ({
  StorefrontService: {
    unpublish: vi.fn()
  }
}));

describe('useUnpublishStorefrontMutation', () => {
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

  it('should call StorefrontService.unpublish and invalidate the storefronts list', async () => {
    vi.mocked(StorefrontService.unpublish).mockResolvedValue(undefined);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUnpublishStorefrontMutation(), {
      wrapper
    });

    result.current.mutate('s1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(StorefrontService.unpublish).toHaveBeenCalledWith('s1');
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['storefronts']
    });
  });
});
