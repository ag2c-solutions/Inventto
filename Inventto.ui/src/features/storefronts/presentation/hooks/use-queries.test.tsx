import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StorefrontApi } from '../../data/api';
import { storefrontFactory } from '../../tests/factories/storefront.factory';

import { useStorefrontsQuery } from './use-queries';

vi.mock('../../data/api', () => ({
  StorefrontApi: {
    getStorefronts: vi.fn()
  }
}));

const { mockUseUser } = vi.hoisted(() => ({ mockUseUser: vi.fn() }));

vi.mock('@/features/users', () => ({
  useUser: mockUseUser
}));

describe('useStorefrontsQuery', () => {
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

  it('should fetch storefronts for the current organization', async () => {
    const mockStorefronts = storefrontFactory.buildList(2);
    vi.mocked(StorefrontApi.getStorefronts).mockResolvedValue(mockStorefronts);

    const { result } = renderHook(() => useStorefrontsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(StorefrontApi.getStorefronts).toHaveBeenCalledWith('org-1');
    expect(result.current.data).toEqual(mockStorefronts);
  });

  it('should not execute the query when there is no current organization', async () => {
    mockUseUser.mockReturnValue({ currentOrganization: null });

    const { result } = renderHook(() => useStorefrontsQuery(), { wrapper });

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));

    expect(StorefrontApi.getStorefronts).not.toHaveBeenCalled();
  });
});
