import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../domain/services';
import {
  recoverPasswordPayloadFactory,
  resetPasswordPayloadFactory,
  signInPayloadFactory,
  signUpPayloadFactory,
  verifyOtpPayloadFactory
} from '../../tests/factories/auth.factory';

import {
  useRecoverPasswordMutation,
  useSetNewPasswordMutation,
  useSignInMutation,
  useSignOutMutation,
  useSignUpMutation,
  useVerifyRecoveryOtpMutation
} from './use-mutations';

vi.mock('../../domain/services', () => ({
  AuthService: {
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    recoverPassword: vi.fn(),
    verifyRecoveryOtp: vi.fn(),
    completePasswordRecovery: vi.fn()
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

      const payload = signInPayloadFactory.build();
      await result.current.mutateAsync(payload);

      expect(AuthService.signIn).toHaveBeenCalledWith(
        payload,
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

      const payload = signUpPayloadFactory.build({ document: undefined });

      await result.current.mutateAsync(payload);

      expect(AuthService.signUp).toHaveBeenCalledWith(
        payload,
        expect.anything()
      );
    });
  });

  describe('useRecoverPasswordMutation', () => {
    it('should call AuthService.recoverPassword with the email', async () => {
      vi.mocked(AuthService.recoverPassword).mockResolvedValue();

      const { result } = renderHook(() => useRecoverPasswordMutation(), {
        wrapper
      });

      const payload = recoverPasswordPayloadFactory.build();
      await result.current.mutateAsync(payload);

      expect(AuthService.recoverPassword).toHaveBeenCalledWith(
        payload,
        expect.anything()
      );
    });

    it('should suppress the global error toast even on failure (RN002)', async () => {
      vi.mocked(AuthService.recoverPassword).mockRejectedValue(
        new Error('rate limit')
      );

      const { result } = renderHook(() => useRecoverPasswordMutation(), {
        wrapper
      });

      await expect(
        result.current.mutateAsync(recoverPasswordPayloadFactory.build())
      ).rejects.toThrow();

      const mutation = queryClient.getMutationCache().getAll()[0];
      expect(mutation.meta?.suppressErrorToast).toBe(true);
    });
  });

  describe('useVerifyRecoveryOtpMutation', () => {
    it('should call AuthService.verifyRecoveryOtp and invalidate auth queries on success', async () => {
      vi.mocked(AuthService.verifyRecoveryOtp).mockResolvedValue({} as never);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useVerifyRecoveryOtpMutation(), {
        wrapper
      });

      const payload = verifyOtpPayloadFactory.build();
      await result.current.mutateAsync(payload);

      expect(AuthService.verifyRecoveryOtp).toHaveBeenCalledWith(
        payload,
        expect.anything()
      );
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['auth'] });
    });

    it('should suppress the global error toast (erro inline no OtpStep)', async () => {
      vi.mocked(AuthService.verifyRecoveryOtp).mockRejectedValue(
        new Error('Código inválido. Verifique e tente novamente.')
      );

      const { result } = renderHook(() => useVerifyRecoveryOtpMutation(), {
        wrapper
      });

      await expect(
        result.current.mutateAsync(verifyOtpPayloadFactory.build())
      ).rejects.toThrow();

      const mutation = queryClient.getMutationCache().getAll()[0];
      expect(mutation.meta?.suppressErrorToast).toBe(true);
    });
  });

  describe('useSetNewPasswordMutation', () => {
    it('should call AuthService.completePasswordRecovery and invalidate auth queries on success', async () => {
      vi.mocked(AuthService.completePasswordRecovery).mockResolvedValue();

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useSetNewPasswordMutation(), {
        wrapper
      });

      const payload = resetPasswordPayloadFactory.build();
      await result.current.mutateAsync(payload);

      expect(AuthService.completePasswordRecovery).toHaveBeenCalledWith(
        payload,
        expect.anything()
      );
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['auth'] });
    });

    it('should expose the success toast message via meta', async () => {
      vi.mocked(AuthService.completePasswordRecovery).mockResolvedValue();

      const { result } = renderHook(() => useSetNewPasswordMutation(), {
        wrapper
      });

      await result.current.mutateAsync(resetPasswordPayloadFactory.build());

      const mutation = queryClient.getMutationCache().getAll()[0];
      expect(mutation.meta?.successMessage).toBe(
        'Senha redefinida com sucesso!'
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
