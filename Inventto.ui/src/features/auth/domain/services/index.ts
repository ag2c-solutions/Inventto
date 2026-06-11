import type { Organization } from '@/features/organizations';

import { AuthAPI } from '../../data/api';
import type {
  RecoverPasswordPayload,
  ResendOtpPayload,
  SignInPayload,
  SignUpPayload,
  VerifyOtpPayload
} from '../../data/dtos';
import type { Session } from '../entities';

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
    callback: (session: Session | null) => void
  ) {
    return AuthAPI.subscribeToAuthChanges(callback);
  }

  static async completeFirstAccess({
    organization,
    ...rest
  }: {
    newPassword: string;
    userId: string;
    organization: Organization | null;
  }) {
    if (!organization?.id) {
      throw new Error('Organização não encontrada.');
    }

    return AuthAPI.completeFirstAccess({ ...rest, orgId: organization.id });
  }
}
