import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthAPI } from '../../data/api';

import { AuthService } from './index';

vi.mock('../../data/api', () => ({
  AuthAPI: {
    resetPassword: vi.fn(),
    signOut: vi.fn()
  }
}));

describe('AuthService.resetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reset the password and end the recovery session (RN012/RN013)', async () => {
    vi.mocked(AuthAPI.resetPassword).mockResolvedValue();
    vi.mocked(AuthAPI.signOut).mockResolvedValue();

    await AuthService.resetPassword({ newPassword: 'NewPass123!' });

    expect(AuthAPI.resetPassword).toHaveBeenCalledWith({
      newPassword: 'NewPass123!'
    });
    expect(AuthAPI.signOut).toHaveBeenCalled();
  });

  it('should not end the session when the reset fails', async () => {
    vi.mocked(AuthAPI.resetPassword).mockRejectedValue(
      new Error('Sessão expirada ou inválida. Tente novamente.')
    );

    await expect(
      AuthService.resetPassword({ newPassword: 'NewPass123!' })
    ).rejects.toThrow();

    expect(AuthAPI.signOut).not.toHaveBeenCalled();
  });
});
