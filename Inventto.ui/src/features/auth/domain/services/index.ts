import type { UserOrganizationContext } from '@/features/users/';

import { AuthAPI } from '../../data/api';
import type { SignInPayload, SignUpPayload } from '../../data/dtos';
import type { Session } from '../entities';

export class AuthService {
  static async signIn(args: SignInPayload) {
    return AuthAPI.signIn(args);
  }

  static async signUp(args: SignUpPayload) {
    return AuthAPI.signUp(args);
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
    organization: UserOrganizationContext | null;
  }) {
    if (!organization?.id) {
      throw new Error('Organização não encontrada.');
    }

    return AuthAPI.completeFirstAccess({ ...rest, orgId: organization.id });
  }
}
