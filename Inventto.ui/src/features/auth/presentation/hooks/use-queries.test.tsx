import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../domain/services';

import { useIsAuthenticatedQuery, useSessionQuery } from './use-queries';

vi.mock('../../domain/services', () => ({
  AuthService: {
    getSession: vi.fn(),
    isAuthenticated: vi.fn()
  }
}));

describe('Auth Queries', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useSessionQuery', () => {
    it('should call AuthService.getSession', async () => {
      vi.mocked(AuthService.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      } as any);

      const { result } = renderHook(() => useSessionQuery(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(AuthService.getSession).toHaveBeenCalled();
    });
  });

  describe('useIsAuthenticatedQuery', () => {
    it('should call AuthService.isAuthenticated', async () => {
      vi.mocked(AuthService.isAuthenticated).mockResolvedValue(false);

      const { result } = renderHook(() => useIsAuthenticatedQuery(), {
        wrapper
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(AuthService.isAuthenticated).toHaveBeenCalled();
    });
  });
});
