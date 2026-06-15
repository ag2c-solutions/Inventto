import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { AuthService } from '../../domain/services';

export function useSignInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['auth', 'signin'],
    mutationFn: AuthService.signIn,
    meta: {
      successMessage: 'Bem-vindo de volta!'
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    }
  });
}

export function useSignUpMutation() {
  return useMutation({
    mutationKey: ['auth', 'signup'],
    mutationFn: AuthService.signUp
  });
}

export function useVerifyOtpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['auth', 'verify-otp'],
    mutationFn: AuthService.verifyOtp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    meta: {
      successMessage: 'E-mail verificado. Bem-vindo ao Inventto!'
    }
  });
}

export function useResendOtpMutation() {
  return useMutation({
    mutationKey: ['auth', 'resend-otp'],
    mutationFn: AuthService.resendOtp
  });
}

export function useRecoverPasswordMutation() {
  return useMutation({
    mutationKey: ['auth', 'recover-password'],
    mutationFn: AuthService.recoverPassword,
    // RN002 (anti-enumeração): nenhum toast de sucesso ou erro — o feedback
    // é a própria tela neutra "sent", que não revela se o e-mail existe.
    meta: {
      suppressErrorToast: true
    }
  });
}

export function useResetPasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['auth', 'reset-password'],
    mutationFn: AuthService.resetPassword,
    meta: {
      successMessage: 'Senha redefinida. Faça login com suas novas credenciais.'
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    }
  });
}

export function useSignOutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['auth', 'signout'],
    mutationFn: AuthService.signOut,
    meta: {
      successMessage: 'Você saiu do sistema.'
    },
    onSuccess: () => {
      queryClient.clear();
    }
  });
}

export function useCompleteFirstAccessMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();

  return useMutation({
    mutationKey: ['auth', 'complete-first-access'],
    mutationFn: (payload: { newPassword: string; userId: string }) =>
      AuthService.completeFirstAccess({
        ...payload,
        organization: currentOrganization
      }),
    meta: {
      successMessage: 'Senha alterada com sucesso! Faça login para continuar.'
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    }
  });
}
