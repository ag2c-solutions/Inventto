import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  UpdateAvatarVariables,
  UpdatePasswordVariables
} from '../../domain/entities';
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

    mutationFn: (variables: UpdatePasswordVariables) =>
      UserService.updatePassword(variables),

    meta: {
      successMessage: 'Senha alterada.',
      suppressErrorToast: true
    }
  });
}
