import { AuthApi } from '../../data/api';
import type { Session } from '../entities';
import type { SignInPayload, SignUpPayload } from '../../data/dtos';

export class AuthService {
  static async signIn(args: SignInPayload) {
    return AuthApi.signIn(args);
  }

  static async signUp(args: SignUpPayload) {
    return AuthApi.signUp(args);
  }

  static async signOut() {
    return AuthApi.signOut();
  }

  static async getSession() {
    return AuthApi.getSession();
  }

  static async isAuthenticated() {
    return AuthApi.isAuthenticated();
  }

  static async subscribeToAuthChanges(
    callback: (session: Session | null) => void
  ) {
    return AuthApi.subscribeToAuthChanges(callback);
  }

  static async completeFirstAccess(args: {
    newPassword: string;
    userId: string;
    orgId: string;
  }) {
    return AuthApi.completeFirstAccess(args);
  }
}
