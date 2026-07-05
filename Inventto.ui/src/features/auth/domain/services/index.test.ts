import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthAPI } from '../../data/api';

import { AuthService } from './index';

vi.mock('../../data/api', () => ({
  AuthAPI: {
    signIn: vi.fn(),
    signUp: vi.fn(),
    verifyOtp: vi.fn(),
    resendOtp: vi.fn(),
    recoverPassword: vi.fn(),
    verifyRecoveryOtp: vi.fn(),
    resetPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    isAuthenticated: vi.fn(),
    subscribeToAuthChanges: vi.fn(),
    signUpFirstAccess: vi.fn(),
    confirmFirstAccess: vi.fn()
  }
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signIn deve delegar para AuthAPI.signIn', async () => {
    vi.mocked(AuthAPI.signIn).mockResolvedValue({} as never);

    await AuthService.signIn({ email: 'a@b.com', password: 'Pass123!' });

    expect(AuthAPI.signIn).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'Pass123!'
    });
  });

  it('signUp deve delegar para AuthAPI.signUp', async () => {
    const payload = {
      companyName: 'Acme',
      fullName: 'John Doe',
      email: 'john@acme.com',
      password: 'Pass123!',
      businessAreaCode: 'clothing',
      acceptedTerms: true as const
    };
    vi.mocked(AuthAPI.signUp).mockResolvedValue({} as never);

    await AuthService.signUp(payload);

    expect(AuthAPI.signUp).toHaveBeenCalledWith(payload);
  });

  it('verifyOtp deve delegar para AuthAPI.verifyOtp', async () => {
    vi.mocked(AuthAPI.verifyOtp).mockResolvedValue({} as never);

    await AuthService.verifyOtp({ email: 'a@b.com', token: '123456' });

    expect(AuthAPI.verifyOtp).toHaveBeenCalledWith({
      email: 'a@b.com',
      token: '123456'
    });
  });

  it('resendOtp deve delegar para AuthAPI.resendOtp', async () => {
    vi.mocked(AuthAPI.resendOtp).mockResolvedValue(undefined);

    await AuthService.resendOtp({ email: 'a@b.com' });

    expect(AuthAPI.resendOtp).toHaveBeenCalledWith({ email: 'a@b.com' });
  });

  it('recoverPassword deve delegar para AuthAPI.recoverPassword', async () => {
    vi.mocked(AuthAPI.recoverPassword).mockResolvedValue(undefined);

    await AuthService.recoverPassword({ email: 'a@b.com' });

    expect(AuthAPI.recoverPassword).toHaveBeenCalledWith({ email: 'a@b.com' });
  });

  it('verifyRecoveryOtp deve delegar para AuthAPI.verifyRecoveryOtp', async () => {
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

  it('completePasswordRecovery deve atualizar a senha mantendo a sessão (sem signOut: cai no dashboard)', async () => {
    vi.mocked(AuthAPI.resetPassword).mockResolvedValue(undefined);

    await AuthService.completePasswordRecovery({ newPassword: 'NewPass123!' });

    expect(AuthAPI.resetPassword).toHaveBeenCalledWith({
      newPassword: 'NewPass123!'
    });
    expect(AuthAPI.signOut).not.toHaveBeenCalled();
  });

  it('completePasswordRecovery deve propagar erros da API', async () => {
    vi.mocked(AuthAPI.resetPassword).mockRejectedValue(
      new Error('Sessão expirada ou inválida. Tente novamente.')
    );

    await expect(
      AuthService.completePasswordRecovery({ newPassword: 'NewPass123!' })
    ).rejects.toThrow();
  });

  it('signOut deve delegar para AuthAPI.signOut', async () => {
    vi.mocked(AuthAPI.signOut).mockResolvedValue(undefined);

    await AuthService.signOut();

    expect(AuthAPI.signOut).toHaveBeenCalledTimes(1);
  });

  it('getSession deve delegar para AuthAPI.getSession', async () => {
    vi.mocked(AuthAPI.getSession).mockResolvedValue(null);

    const result = await AuthService.getSession();

    expect(AuthAPI.getSession).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });

  it('isAuthenticated deve delegar para AuthAPI.isAuthenticated', async () => {
    vi.mocked(AuthAPI.isAuthenticated).mockResolvedValue(true);

    const result = await AuthService.isAuthenticated();

    expect(AuthAPI.isAuthenticated).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('subscribeToAuthChanges deve delegar para AuthAPI.subscribeToAuthChanges', async () => {
    const unsubscribe = vi.fn();
    vi.mocked(AuthAPI.subscribeToAuthChanges).mockResolvedValue(unsubscribe);

    const callback = vi.fn();
    const result = await AuthService.subscribeToAuthChanges(callback);

    expect(AuthAPI.subscribeToAuthChanges).toHaveBeenCalledWith(callback);
    expect(result).toBe(unsubscribe);
  });

  it('setFirstAccessPassword deve definir a senha e então reenviar o OTP de confirmação', async () => {
    vi.mocked(AuthAPI.resetPassword).mockResolvedValue(undefined);
    vi.mocked(AuthAPI.signUpFirstAccess).mockResolvedValue(undefined);

    await AuthService.setFirstAccessPassword({
      newPassword: 'NewPass123!',
      email: 'a@b.com'
    });

    expect(AuthAPI.resetPassword).toHaveBeenCalledWith({
      newPassword: 'NewPass123!'
    });
    expect(AuthAPI.signUpFirstAccess).toHaveBeenCalledWith({
      email: 'a@b.com'
    });
  });

  describe('confirmFirstAccess', () => {
    it('deve lançar erro quando a organização não tem id', async () => {
      await expect(
        AuthService.confirmFirstAccess({
          email: 'a@b.com',
          token: '123456',
          userId: 'user-1',
          organization: null
        })
      ).rejects.toThrow('Organização não encontrada.');

      expect(AuthAPI.verifyOtp).not.toHaveBeenCalled();
      expect(AuthAPI.confirmFirstAccess).not.toHaveBeenCalled();
    });

    it('deve verificar o OTP e confirmar o acesso com o orgId da organização', async () => {
      vi.mocked(AuthAPI.verifyOtp).mockResolvedValue({} as never);
      vi.mocked(AuthAPI.confirmFirstAccess).mockResolvedValue(undefined);

      await AuthService.confirmFirstAccess({
        email: 'a@b.com',
        token: '123456',
        userId: 'user-1',
        organization: { id: 'org-1' } as never
      });

      expect(AuthAPI.verifyOtp).toHaveBeenCalledWith({
        email: 'a@b.com',
        token: '123456'
      });
      expect(AuthAPI.confirmFirstAccess).toHaveBeenCalledWith({
        userId: 'user-1',
        orgId: 'org-1'
      });
    });
  });
});
