import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthAPI } from '../../data/api';
import {
  recoverPasswordPayloadFactory,
  resendOtpPayloadFactory,
  resetPasswordPayloadFactory,
  signInPayloadFactory,
  signUpPayloadFactory,
  verifyOtpPayloadFactory
} from '../../tests/factories/auth.factory';

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
    const payload = signInPayloadFactory.build();
    vi.mocked(AuthAPI.signIn).mockResolvedValue({} as never);

    await AuthService.signIn(payload);

    expect(AuthAPI.signIn).toHaveBeenCalledWith(payload);
  });

  it('signUp deve delegar para AuthAPI.signUp', async () => {
    const payload = signUpPayloadFactory.build({ document: undefined });
    vi.mocked(AuthAPI.signUp).mockResolvedValue({} as never);

    await AuthService.signUp(payload);

    expect(AuthAPI.signUp).toHaveBeenCalledWith(payload);
  });

  it('verifyOtp deve delegar para AuthAPI.verifyOtp', async () => {
    const payload = verifyOtpPayloadFactory.build();
    vi.mocked(AuthAPI.verifyOtp).mockResolvedValue({} as never);

    await AuthService.verifyOtp(payload);

    expect(AuthAPI.verifyOtp).toHaveBeenCalledWith(payload);
  });

  it('resendOtp deve delegar para AuthAPI.resendOtp', async () => {
    const payload = resendOtpPayloadFactory.build();
    vi.mocked(AuthAPI.resendOtp).mockResolvedValue(undefined);

    await AuthService.resendOtp(payload);

    expect(AuthAPI.resendOtp).toHaveBeenCalledWith(payload);
  });

  it('recoverPassword deve delegar para AuthAPI.recoverPassword', async () => {
    const payload = recoverPasswordPayloadFactory.build();
    vi.mocked(AuthAPI.recoverPassword).mockResolvedValue(undefined);

    await AuthService.recoverPassword(payload);

    expect(AuthAPI.recoverPassword).toHaveBeenCalledWith(payload);
  });

  it('verifyRecoveryOtp deve delegar para AuthAPI.verifyRecoveryOtp', async () => {
    const payload = verifyOtpPayloadFactory.build();
    vi.mocked(AuthAPI.verifyRecoveryOtp).mockResolvedValue({} as never);

    await AuthService.verifyRecoveryOtp(payload);

    expect(AuthAPI.verifyRecoveryOtp).toHaveBeenCalledWith(payload);
  });

  it('completePasswordRecovery deve atualizar a senha mantendo a sessão (sem signOut: cai no dashboard)', async () => {
    const payload = resetPasswordPayloadFactory.build();
    vi.mocked(AuthAPI.resetPassword).mockResolvedValue(undefined);

    await AuthService.completePasswordRecovery(payload);

    expect(AuthAPI.resetPassword).toHaveBeenCalledWith(payload);
    expect(AuthAPI.signOut).not.toHaveBeenCalled();
  });

  it('completePasswordRecovery deve propagar erros da API', async () => {
    vi.mocked(AuthAPI.resetPassword).mockRejectedValue(
      new Error('Sessão expirada ou inválida. Tente novamente.')
    );

    await expect(
      AuthService.completePasswordRecovery(resetPasswordPayloadFactory.build())
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
    const newPassword = faker.internet.password({ length: 12 });
    const email = faker.internet.email();
    vi.mocked(AuthAPI.resetPassword).mockResolvedValue(undefined);
    vi.mocked(AuthAPI.signUpFirstAccess).mockResolvedValue(undefined);

    await AuthService.setFirstAccessPassword({ newPassword, email });

    expect(AuthAPI.resetPassword).toHaveBeenCalledWith({ newPassword });
    expect(AuthAPI.signUpFirstAccess).toHaveBeenCalledWith({ email });
  });

  describe('confirmFirstAccess', () => {
    it('deve lançar erro quando a organização não tem id', async () => {
      await expect(
        AuthService.confirmFirstAccess({
          email: faker.internet.email(),
          token: faker.string.numeric(6),
          userId: faker.string.uuid(),
          organization: null
        })
      ).rejects.toThrow('Organização não encontrada.');

      expect(AuthAPI.verifyOtp).not.toHaveBeenCalled();
      expect(AuthAPI.confirmFirstAccess).not.toHaveBeenCalled();
    });

    it('deve verificar o OTP e confirmar o acesso com o orgId da organização', async () => {
      const email = faker.internet.email();
      const token = faker.string.numeric(6);
      const userId = faker.string.uuid();
      const orgId = faker.string.uuid();
      vi.mocked(AuthAPI.verifyOtp).mockResolvedValue({} as never);
      vi.mocked(AuthAPI.confirmFirstAccess).mockResolvedValue(undefined);

      await AuthService.confirmFirstAccess({
        email,
        token,
        userId,
        organization: { id: orgId } as never
      });

      expect(AuthAPI.verifyOtp).toHaveBeenCalledWith({ email, token });
      expect(AuthAPI.confirmFirstAccess).toHaveBeenCalledWith({
        userId,
        orgId
      });
    });
  });
});
