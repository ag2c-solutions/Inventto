import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StorefrontApi } from '../../data/api';
import { storefrontFactory } from '../../tests/factories/storefront.factory';

import {
  useCheckSlugQuery,
  useStorefrontQuery,
  useStorefrontsQuery
} from './use-queries';

vi.mock('../../data/api', () => ({
  StorefrontApi: {
    getStorefronts: vi.fn(),
    getStorefront: vi.fn(),
    checkSlug: vi.fn()
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

describe('useStorefrontQuery', () => {
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

  it('should fetch the storefront by id', async () => {
    const storefront = storefrontFactory.build({ id: 's1' });
    vi.mocked(StorefrontApi.getStorefront).mockResolvedValue(storefront);

    const { result } = renderHook(() => useStorefrontQuery('s1'), {
      wrapper
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(StorefrontApi.getStorefront).toHaveBeenCalledWith('s1');
    expect(result.current.data).toEqual(storefront);
  });

  it('should not execute the query when there is no id (create mode)', async () => {
    const { result } = renderHook(() => useStorefrontQuery(undefined), {
      wrapper
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));

    expect(StorefrontApi.getStorefront).not.toHaveBeenCalled();
  });
});

describe('useCheckSlugQuery', () => {
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

  it('should debounce and only check after the value settles', async () => {
    vi.mocked(StorefrontApi.checkSlug).mockResolvedValue({
      available: true,
      reason: 'ok'
    });

    const { result, rerender } = renderHook(
      ({ slug }) => useCheckSlugQuery(slug),
      { wrapper, initialProps: { slug: '' } }
    );

    rerender({ slug: 'atelie-joana' });

    expect(result.current.isSettled).toBe(false);
    expect(StorefrontApi.checkSlug).not.toHaveBeenCalled();

    await waitFor(() => expect(result.current.isSettled).toBe(true));
    expect(StorefrontApi.checkSlug).toHaveBeenCalledWith(
      'atelie-joana',
      undefined
    );
  });

  it('should not check slugs shorter than 3 characters', async () => {
    const { result } = renderHook(() => useCheckSlugQuery('ab'), { wrapper });

    await waitFor(() => expect(result.current.isSettled).toBe(true));

    expect(StorefrontApi.checkSlug).not.toHaveBeenCalled();
  });

  it('should ignore its own storefront id on edit', async () => {
    vi.mocked(StorefrontApi.checkSlug).mockResolvedValue({
      available: true,
      reason: 'ok'
    });

    renderHook(() => useCheckSlugQuery('atelie-joana', 's1'), { wrapper });

    await waitFor(() =>
      expect(StorefrontApi.checkSlug).toHaveBeenCalledWith('atelie-joana', 's1')
    );
  });
});
