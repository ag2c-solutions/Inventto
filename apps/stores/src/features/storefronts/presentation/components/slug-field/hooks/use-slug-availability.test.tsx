import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StorefrontApi } from '../../../../data/api';

import { useSlugAvailability } from './use-slug-availability';

vi.mock('../../../../data/api', () => ({
  StorefrontApi: {
    checkSlug: vi.fn()
  }
}));

describe('useSlugAvailability', () => {
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

  it('should return idle for an empty slug', () => {
    const { result } = renderHook(() => useSlugAvailability(''), { wrapper });

    expect(result.current).toBe('idle');
  });

  it('should return invalid for a slug shorter than 3 characters', () => {
    const { result } = renderHook(() => useSlugAvailability('ab'), {
      wrapper
    });

    expect(result.current).toBe('invalid');
  });

  it('should return checking while the debounce/query settles', () => {
    const { result } = renderHook(() => useSlugAvailability('atelie-joana'), {
      wrapper
    });

    expect(result.current).toBe('checking');
  });

  it('should return ok when the server confirms availability', async () => {
    vi.mocked(StorefrontApi.checkSlug).mockResolvedValue({
      available: true,
      reason: 'ok'
    });

    const { result } = renderHook(() => useSlugAvailability('atelie-joana'), {
      wrapper
    });

    await waitFor(() => expect(result.current).toBe('ok'));
  });

  it('should return taken when the server reports the slug is in use', async () => {
    vi.mocked(StorefrontApi.checkSlug).mockResolvedValue({
      available: false,
      reason: 'taken'
    });

    const { result } = renderHook(() => useSlugAvailability('loja-centro'), {
      wrapper
    });

    await waitFor(() => expect(result.current).toBe('taken'));
  });

  it('should return reserved when the server reports quarantine', async () => {
    vi.mocked(StorefrontApi.checkSlug).mockResolvedValue({
      available: false,
      reason: 'reserved'
    });

    const { result } = renderHook(() => useSlugAvailability('loja-centro'), {
      wrapper
    });

    await waitFor(() => expect(result.current).toBe('reserved'));
  });

  it('should pass the storefront id through so the query ignores it on edit', async () => {
    vi.mocked(StorefrontApi.checkSlug).mockResolvedValue({
      available: true,
      reason: 'ok'
    });

    renderHook(() => useSlugAvailability('atelie-joana', 's1'), { wrapper });

    await waitFor(() =>
      expect(StorefrontApi.checkSlug).toHaveBeenCalledWith('atelie-joana', 's1')
    );
  });
});
