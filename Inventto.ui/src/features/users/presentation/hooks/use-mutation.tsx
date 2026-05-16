import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateAvatarVariables } from '../../domain/entities';
import { UserService } from '../../domain/services';
import { USERS_KEYS } from '../constants';

export function useUpdateAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['users', 'update-avatar'],

    mutationFn: (variables: UpdateAvatarVariables) =>
      UserService.updateAvatar(variables),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: USERS_KEYS.profile(variables.userId)
      });
    },

    meta: {
      successMessage: 'Avatar atualizado com sucesso!'
    }
  });
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationKey: ['users', 'update-password'],

    mutationFn: (password: string) => UserService.updatePassword(password),

    meta: {
      successMessage: 'Senha atualizada com sucesso!'
    }
  });
}
