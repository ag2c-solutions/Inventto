import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthAPI } from '../../data/api';

import { AuthService } from './index';

vi.mock('../../data/api', () => ({
  AuthAPI: {
    resetPassword: vi.fn(),
    verifyRecoveryOtp: vi.fn(),
    signOut: vi.fn()
  }
}));

describe('AuthService.completePasswordRecovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update the password keeping the session (sem signOut: cai no dashboard)', async () => {
    vi.mocked(AuthAPI.resetPassword).mockResolvedValue();

    await AuthService.completePasswordRecovery({ newPassword: 'NewPass123!' });

    expect(AuthAPI.resetPassword).toHaveBeenCalledWith({
      newPassword: 'NewPass123!'
    });
    expect(AuthAPI.signOut).not.toHaveBeenCalled();
  });

  it('should propagate errors from the API', async () => {
    vi.mocked(AuthAPI.resetPassword).mockRejectedValue(
      new Error('Sessão expirada ou inválida. Tente novamente.')
    );

    await expect(
      AuthService.completePasswordRecovery({ newPassword: 'NewPass123!' })
    ).rejects.toThrow();
  });
});

describe('AuthService.verifyRecoveryOtp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delegate to AuthAPI.verifyRecoveryOtp', async () => {
    vi.mocked(AuthAPI.verifyRecoveryOtp).mockResolvedValue({} as never);

    await AuthService.verifyRecoveryOtp({
      email: 'test@test.com',
      token: '123456'
    });

    expect(AuthAPI.verifyRecoveryOtp).toHaveBeenCalledWith({
      email: 'test@test.com',
      token: '123456'
    });
  });
});
