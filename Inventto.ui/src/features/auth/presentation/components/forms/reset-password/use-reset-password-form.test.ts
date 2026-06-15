import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useResetPasswordForm } from './use-reset-password-form';

const mockNavigate = vi.fn();
const mockResetPassword = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../../hooks/use-mutations', () => ({
  useResetPasswordMutation: () => ({
    mutateAsync: mockResetPassword,
    isPending: false
  })
}));

describe('useResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should map the password to the newPassword payload and navigate to login on success', async () => {
    mockResetPassword.mockResolvedValue(undefined);

    const { result } = renderHook(() => useResetPasswordForm());

    await act(async () => {
      await result.current.onSubmit({
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!'
      });
    });

    expect(mockResetPassword).toHaveBeenCalledWith({
      newPassword: 'NewPass123!'
    });
    expect(mockNavigate).toHaveBeenCalledWith('/auth/login', {
      replace: true
    });
  });

  it('should keep the user on the form when the reset fails', async () => {
    mockResetPassword.mockRejectedValue(
      new Error('Sessão expirada ou inválida. Tente novamente.')
    );

    const { result } = renderHook(() => useResetPasswordForm());

    await act(async () => {
      await result.current.onSubmit({
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!'
      });
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
