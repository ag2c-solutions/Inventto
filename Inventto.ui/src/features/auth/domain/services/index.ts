import type { Organization } from '@/features/organizations';

import { AuthAPI } from '../../data/api';
import type {
  RecoverPasswordPayload,
  ResendOtpPayload,
  ResetPasswordPayload,
  SignInPayload,
  SignUpPayload,
  VerifyOtpPayload
} from '../../data/dtos'; // eslint-disable-line boundaries/dependencies -- TODO: domain/services não deveria receber tipos de data/dtos diretamente; AuthService é passthrough fino pro SDK de auth
import type { AuthChangeEvent, Session } from '../entities';

export class AuthService {
  static async signIn(args: SignInPayload) {
    return AuthAPI.signIn(args);
  }

  static async signUp(args: SignUpPayload) {
    return AuthAPI.signUp(args);
  }

  static async verifyOtp(args: VerifyOtpPayload) {
    return AuthAPI.verifyOtp(args);
  }

  static async resendOtp(args: ResendOtpPayload) {
    return AuthAPI.resendOtp(args);
  }

  static async recoverPassword(args: RecoverPasswordPayload) {
    return AuthAPI.recoverPassword(args);
  }

  static async verifyRecoveryOtp(args: VerifyOtpPayload) {
    return AuthAPI.verifyRecoveryOtp(args);
  }

  // Recuperação por OTP: a sessão criada no verifyRecoveryOtp é mantida para o
  // usuário cair autenticado no dashboard — por isso NÃO há signOut aqui.
  static async completePasswordRecovery(args: ResetPasswordPayload) {
    return AuthAPI.resetPassword(args);
  }

  static async signOut() {
    return AuthAPI.signOut();
  }

  static async getSession() {
    return AuthAPI.getSession();
  }

  static async isAuthenticated() {
    return AuthAPI.isAuthenticated();
  }

  static async subscribeToAuthChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return AuthAPI.subscribeToAuthChanges(callback);
  }

  static async setFirstAccessPassword({
    newPassword,
    email
  }: {
    newPassword: string;
    email: string;
  }) {
    await AuthAPI.resetPassword({ newPassword });
    await AuthAPI.signUpFirstAccess({ email });
  }

  static async confirmFirstAccess({
    organization,
    ...rest
  }: {
    email: string;
    token: string;
    userId: string;
    organization: Organization | null;
  }) {
    if (!organization?.id) {
      throw new Error('Organização não encontrada.');
    }

    await AuthAPI.verifyOtp({
      email: rest.email,
      token: rest.token
    });

    return AuthAPI.confirmFirstAccess({
      userId: rest.userId,
      orgId: organization.id
    });
  }
}
