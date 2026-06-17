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
    // Erros de OTP (código inválido, expirado) são exibidos inline no OtpStep.
    meta: {
      successMessage: 'E-mail verificado. Bem-vindo ao Inventto!',
      suppressErrorToast: true
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
    // RN002 (anti-enumeração): nenhum toast de sucesso ou erro — o fluxo avança
    // para o passo de OTP sem revelar se o e-mail existe.
    meta: {
      suppressErrorToast: true
    }
  });
}

export function useVerifyRecoveryOtpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['auth', 'verify-recovery-otp'],
    mutationFn: AuthService.verifyRecoveryOtp,
    // Erro de código inválido/expirado é exibido inline no OtpStep.
    meta: {
      suppressErrorToast: true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    }
  });
}

export function useSetNewPasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['auth', 'set-new-password'],
    mutationFn: AuthService.completePasswordRecovery,
    meta: {
      successMessage: 'Senha redefinida com sucesso!'
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

export function useSetFirstAccessPasswordMutation() {
  return useMutation({
    mutationKey: ['auth', 'set-first-access-password'],
    mutationFn: (payload: { newPassword: string; email: string }) =>
      AuthService.setFirstAccessPassword(payload),
    meta: {
      errorMessage: 'Não foi possível definir a senha. Tente novamente.'
    }
  });
}

export function useConfirmFirstAccessMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();

  return useMutation({
    mutationKey: ['auth', 'confirm-first-access'],
    mutationFn: (payload: { email: string; token: string; userId: string }) =>
      AuthService.confirmFirstAccess({
        ...payload,
        organization: currentOrganization
      }),
    // Erros de OTP (código inválido, expirado) são exibidos inline no OtpStep.
    meta: {
      successMessage: 'Acesso ativado. Bem-vindo(a) ao Inventto!',
      suppressErrorToast: true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    }
  });
}
