import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../domain/services';

import {
  useSignInMutation,
  useSignOutMutation,
  useSignUpMutation
} from './use-mutations';

vi.mock('../../domain/services', () => ({
  AuthService: {
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn()
  }
}));

vi.mock('@/features/users', () => ({
  useUser: () => ({ currentOrganization: { id: 'org-123' } })
}));

describe('Auth Mutations', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false
        }
      }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useSignInMutation', () => {
    it('should call AuthService.signIn and invalidate queries on success', async () => {
      vi.mocked(AuthService.signIn).mockResolvedValue({
        user: { id: '1' }
      } as never);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useSignInMutation(), { wrapper });

      await result.current.mutateAsync({
        email: 'test@test.com',
        password: '123'
      });

      expect(AuthService.signIn).toHaveBeenCalledWith(
        { email: 'test@test.com', password: '123' },
        expect.anything()
      );

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['auth'] });
    });
  });

  describe('useSignUpMutation', () => {
    it('should call AuthService.signUp', async () => {
      vi.mocked(AuthService.signUp).mockResolvedValue({
        user: { id: '2' }
      } as never);

      const { result } = renderHook(() => useSignUpMutation(), { wrapper });

      const payload = {
        email: 'new@test.com',
        password: '123',
        fullName: 'New',
        companyName: 'Corp',
        businessAreaId: 'area-1',
        acceptedTerms: true as const
      };

      await result.current.mutateAsync(payload);

      expect(AuthService.signUp).toHaveBeenCalledWith(
        payload,
        expect.anything()
      );
    });
  });

  describe('useSignOutMutation', () => {
    it('should call AuthService.signOut and clear queryClient on success', async () => {
      vi.mocked(AuthService.signOut).mockResolvedValue();

      const clearSpy = vi.spyOn(queryClient, 'clear');
      const { result } = renderHook(() => useSignOutMutation(), { wrapper });

      await result.current.mutateAsync();

      expect(AuthService.signOut).toHaveBeenCalled();
      expect(clearSpy).toHaveBeenCalled();
    });
  });
});
