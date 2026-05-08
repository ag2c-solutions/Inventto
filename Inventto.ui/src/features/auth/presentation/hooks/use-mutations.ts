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
    mutationFn: AuthService.signUp,
    meta: {
      successMessage: 'Conta criada com sucesso! Faça login para continuar.'
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
    mutationFn: (payload: { newPassword: string; userId: string }) => {
      if (!currentOrganization?.id) {
        throw new Error('Organização não encontrada.');
      }

      return AuthService.completeFirstAccess({
        ...payload,
        orgId: currentOrganization.id
      });
    },
    meta: {
      successMessage: 'Senha alterada com sucesso! Faça login para continuar.'
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    }
  });
}
