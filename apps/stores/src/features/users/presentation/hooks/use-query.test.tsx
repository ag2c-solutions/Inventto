import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserAPI } from '../../data/api';
import type { User } from '../../domain/entities';

import { useUserProfileQuery } from './use-query';

vi.mock('../../data/api', () => ({
  UserAPI: {
    getProfile: vi.fn()
  }
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Users React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useUserProfileQuery', () => {
    it('should not fetch profile when userId is undefined', async () => {
      const { result } = renderHook(() => useUserProfileQuery(undefined), {
        wrapper: createWrapper()
      });

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(UserAPI.getProfile).not.toHaveBeenCalled();
    });

    it('should fetch profile when userId is provided', async () => {
      const mockUser = { id: '123', fullName: 'John Doe' } as User;
      vi.mocked(UserAPI.getProfile).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useUserProfileQuery('123'), {
        wrapper: createWrapper()
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(UserAPI.getProfile).toHaveBeenCalledWith('123');
      expect(result.current.data).toEqual(mockUser);
    });
  });
});
