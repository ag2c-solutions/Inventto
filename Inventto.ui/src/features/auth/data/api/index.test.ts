import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  confirmFirstAccessPayloadFactory,
  recoverPasswordPayloadFactory,
  resendOtpPayloadFactory,
  resetPasswordPayloadFactory,
  signInPayloadFactory,
  signUpFirstAccessPayloadFactory,
  signUpPayloadFactory,
  verifyOtpPayloadFactory
} from '../../tests/factories/auth.factory';

const { mockAuth, mockRpc } = vi.hoisted(() => ({
  mockAuth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    verifyOtp: vi.fn(),
    resend: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn()
  },
  mockRpc: vi.fn()
}));

vi.mock('@/infra/supabase', () => ({
  supabase: { auth: mockAuth, rpc: mockRpc }
}));

const mockHandleAuthError = vi.fn((error: unknown, _action: string) => {
  throw error instanceof Error ? error : new Error(String(error));
});

vi.mock('../handlers/error-handler', () => ({
  handleAuthError: (error: unknown, action: string) =>
    mockHandleAuthError(error, action)
}));

import { AuthAPI } from './index';

describe('AuthAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn', () => {
    it('should call supabase.auth.signInWithPassword and return the data', async () => {
      const payload = signInPayloadFactory.build();
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'u1' } },
        error: null
      });

      const result = await AuthAPI.signIn(payload);

      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith(payload);
      expect(result).toEqual({ user: { id: 'u1' } });
    });

    it('should delegate to handleAuthError when supabase returns an error', async () => {
      const error = new Error('Invalid login credentials');
      mockAuth.signInWithPassword.mockResolvedValue({ data: null, error });

      await expect(
        AuthAPI.signIn(signInPayloadFactory.build())
      ).rejects.toThrow('Invalid login credentials');

      expect(mockHandleAuthError).toHaveBeenCalledWith(error, 'signIn');
    });
  });

  describe('signUp', () => {
    const payload = signUpPayloadFactory.build();

    it('should map the payload to Supabase metadata and sign up', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: { user: { id: 'u1' } },
        error: null
      });

      const result = await AuthAPI.signUp(payload);

      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: payload.email,
        password: payload.password,
        options: {
          data: expect.objectContaining({
            full_name: payload.fullName,
            company_name: payload.companyName,
            company_document: payload.document,
            business_area_code: payload.businessAreaCode
          })
        }
      });
      expect(result).toEqual({ user: { id: 'u1' } });
    });

    it('should throw when Supabase does not return a user', async () => {
      mockAuth.signUp.mockResolvedValue({ data: { user: null }, error: null });

      await expect(AuthAPI.signUp(payload)).rejects.toThrow(
        'Erro ao criar usuário de autenticação.'
      );
    });

    it('should delegate to handleAuthError when supabase returns an error', async () => {
      const error = new Error('User already registered');
      mockAuth.signUp.mockResolvedValue({ data: { user: null }, error });

      await expect(AuthAPI.signUp(payload)).rejects.toThrow(
        'User already registered'
      );
      expect(mockHandleAuthError).toHaveBeenCalledWith(error, 'signUp');
    });
  });

  describe('verifyOtp', () => {
    it('should verify with type "signup"', async () => {
      const payload = verifyOtpPayloadFactory.build();
      mockAuth.verifyOtp.mockResolvedValue({
        data: { session: {} },
        error: null
      });

      await AuthAPI.verifyOtp(payload);

      expect(mockAuth.verifyOtp).toHaveBeenCalledWith({
        ...payload,
        type: 'signup'
      });
    });

    it('should delegate to handleAuthError on failure', async () => {
      const error = new Error('Token has expired or is invalid');
      mockAuth.verifyOtp.mockResolvedValue({ data: null, error });

      await expect(
        AuthAPI.verifyOtp(verifyOtpPayloadFactory.build())
      ).rejects.toThrow('Token has expired or is invalid');
      expect(mockHandleAuthError).toHaveBeenCalledWith(error, 'verifyOtp');
    });
  });

  describe('verifyRecoveryOtp', () => {
    it('should verify with type "recovery"', async () => {
      const payload = verifyOtpPayloadFactory.build();
      mockAuth.verifyOtp.mockResolvedValue({
        data: { session: {} },
        error: null
      });

      await AuthAPI.verifyRecoveryOtp(payload);

      expect(mockAuth.verifyOtp).toHaveBeenCalledWith({
        ...payload,
        type: 'recovery'
      });
    });
  });

  describe('resendOtp', () => {
    it('should resend with type "signup"', async () => {
      const payload = resendOtpPayloadFactory.build();
      mockAuth.resend.mockResolvedValue({ error: null });

      await AuthAPI.resendOtp(payload);

      expect(mockAuth.resend).toHaveBeenCalledWith({
        type: 'signup',
        ...payload
      });
    });

    it('should delegate to handleAuthError on failure', async () => {
      const error = new Error('Rate limit exceeded');
      mockAuth.resend.mockResolvedValue({ error });

      await expect(
        AuthAPI.resendOtp(resendOtpPayloadFactory.build())
      ).rejects.toThrow('Rate limit exceeded');
      expect(mockHandleAuthError).toHaveBeenCalledWith(error, 'resendOtp');
    });
  });

  describe('recoverPassword', () => {
    it('should call resetPasswordForEmail without a redirectTo (OTP flow, not magic link)', async () => {
      const payload = recoverPasswordPayloadFactory.build();
      mockAuth.resetPasswordForEmail.mockResolvedValue({ error: null });

      await AuthAPI.recoverPassword(payload);

      expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        payload.email
      );
    });
  });

  describe('resetPassword', () => {
    it('should call updateUser with the new password', async () => {
      const payload = resetPasswordPayloadFactory.build();
      mockAuth.updateUser.mockResolvedValue({ error: null });

      await AuthAPI.resetPassword(payload);

      expect(mockAuth.updateUser).toHaveBeenCalledWith({
        password: payload.newPassword
      });
    });
  });

  describe('signOut', () => {
    it('should call supabase.auth.signOut', async () => {
      mockAuth.signOut.mockResolvedValue({ error: null });

      await AuthAPI.signOut();

      expect(mockAuth.signOut).toHaveBeenCalledTimes(1);
    });

    it('should delegate to handleAuthError on failure', async () => {
      const error = new Error('Auth session missing!');
      mockAuth.signOut.mockResolvedValue({ error });

      await expect(AuthAPI.signOut()).rejects.toThrow('Auth session missing!');
      expect(mockHandleAuthError).toHaveBeenCalledWith(error, 'signOut');
    });
  });

  describe('getSession', () => {
    it('should return the session when one exists', async () => {
      const session = {
        access_token: faker.string.alphanumeric(20),
        user: { id: 'u1' }
      };
      mockAuth.getSession.mockResolvedValue({
        data: { session },
        error: null
      });

      const result = await AuthAPI.getSession();

      expect(result).toEqual(session);
    });

    it('should return null when there is no session', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      const result = await AuthAPI.getSession();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when a session exists', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: { access_token: 'tok' } },
        error: null
      });

      expect(await AuthAPI.isAuthenticated()).toBe(true);
    });

    it('should return false when there is no session', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      expect(await AuthAPI.isAuthenticated()).toBe(false);
    });
  });

  describe('subscribeToAuthChanges', () => {
    it('should subscribe and forward auth state changes to the callback', async () => {
      const unsubscribe = vi.fn();
      let registeredHandler:
        | ((event: string, session: unknown) => void)
        | undefined;

      mockAuth.onAuthStateChange.mockImplementation((handler) => {
        registeredHandler = handler;
        return { data: { subscription: { unsubscribe } } };
      });

      const callback = vi.fn();
      const unsubscribeFn = await AuthAPI.subscribeToAuthChanges(callback);

      registeredHandler?.('SIGNED_IN', { access_token: 'tok' });
      expect(callback).toHaveBeenCalledWith('SIGNED_IN', {
        access_token: 'tok'
      });

      unsubscribeFn();
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('signUpFirstAccess', () => {
    it('should resend the signup OTP for the given email', async () => {
      const payload = signUpFirstAccessPayloadFactory.build();
      mockAuth.resend.mockResolvedValue({ error: null });

      await AuthAPI.signUpFirstAccess(payload);

      expect(mockAuth.resend).toHaveBeenCalledWith({
        type: 'signup',
        ...payload
      });
    });

    it('should delegate to handleAuthError on failure', async () => {
      const error = new Error('Rate limit exceeded');
      mockAuth.resend.mockResolvedValue({ error });

      await expect(
        AuthAPI.signUpFirstAccess(signUpFirstAccessPayloadFactory.build())
      ).rejects.toThrow('Rate limit exceeded');
      expect(mockHandleAuthError).toHaveBeenCalledWith(
        error,
        'signUpFirstAccess'
      );
    });
  });

  describe('confirmFirstAccess', () => {
    it('should call the confirm_first_access RPC with the mapped params', async () => {
      const payload = confirmFirstAccessPayloadFactory.build();
      mockRpc.mockResolvedValue({ error: null });

      await AuthAPI.confirmFirstAccess(payload);

      expect(mockRpc).toHaveBeenCalledWith('confirm_first_access', {
        p_user_id: payload.userId,
        p_organization_id: payload.orgId
      });
    });

    it('should delegate to handleAuthError on failure', async () => {
      const error = new Error('Permissão negada.');
      mockRpc.mockResolvedValue({ error });

      await expect(
        AuthAPI.confirmFirstAccess(confirmFirstAccessPayloadFactory.build())
      ).rejects.toThrow('Permissão negada.');
      expect(mockHandleAuthError).toHaveBeenCalledWith(
        error,
        'confirmFirstAccess'
      );
    });
  });
});
