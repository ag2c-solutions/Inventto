import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserService } from '../../domain/services';

import {
  useUpdateAvatarMutation,
  useUpdatePasswordMutation
} from './use-mutation';

vi.mock('../../domain/services', () => ({
  UserService: {
    updateAvatar: vi.fn(),
    updatePassword: vi.fn()
  }
}));

vi.mock('../constants', () => ({
  USERS_KEYS: {
    profile: (userId: string) => ['users', 'profile', userId]
  }
}));

const mockUpdateAvatar = vi.mocked(UserService.updateAvatar);
const mockUpdatePassword = vi.mocked(UserService.updatePassword);

describe('User mutations', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        },
        mutations: {
          retry: false
        }
      }
    });
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useUpdateAvatarMutation', () => {
    const variables = {
      userId: 'user-123',
      file: new File(['content'], 'avatar.png', { type: 'image/png' })
    };

    it('should call UserService.updateAvatar with mutation variables', async () => {
      mockUpdateAvatar.mockResolvedValue();

      const { result } = renderHook(() => useUpdateAvatarMutation(), {
        wrapper
      });

      await result.current.mutateAsync(variables);

      expect(mockUpdateAvatar).toHaveBeenCalledWith(variables);
    });

    it('should invalidate user profile and auth queries on success', async () => {
      mockUpdateAvatar.mockResolvedValue();

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateAvatarMutation(), {
        wrapper
      });

      await result.current.mutateAsync(variables);

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['users', 'profile', variables.userId]
      });
    });

    it('should not invalidate queries when update avatar fails', async () => {
      mockUpdateAvatar.mockRejectedValue(
        new Error('Erro ao atualizar avatar.')
      );

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateAvatarMutation(), {
        wrapper
      });

      await expect(result.current.mutateAsync(variables)).rejects.toThrow(
        'Erro ao atualizar avatar.'
      );

      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });

  describe('useUpdatePasswordMutation', () => {
    it('should call UserService.updatePassword with mutation variables', async () => {
      mockUpdatePassword.mockResolvedValue();

      const { result } = renderHook(() => useUpdatePasswordMutation(), {
        wrapper
      });

      await result.current.mutateAsync('new-password');

      expect(mockUpdatePassword).toHaveBeenCalledWith('new-password');
    });

    it('should propagate update password errors', async () => {
      mockUpdatePassword.mockRejectedValue(new Error('Senha obrigatória.'));

      const { result } = renderHook(() => useUpdatePasswordMutation(), {
        wrapper
      });

      await expect(result.current.mutateAsync('')).rejects.toThrow(
        'Senha obrigatória.'
      );

      expect(mockUpdatePassword).toHaveBeenCalledWith('');
    });
  });
});
