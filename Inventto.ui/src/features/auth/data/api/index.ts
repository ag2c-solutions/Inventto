import { supabase } from '@/infra/supabase';

import type { Session } from '../../domain/entities';
import type { SignInPayload, SignUpPayload } from '../dtos';
import { handleAuthError } from '../handlers/error-handler';
import { AuthMapper } from '../mappers';

export class AuthAPI {
  static async signIn({ email, password }: SignInPayload) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      handleAuthError(error, 'signIn');
    }

    return data;
  }

  static async signUp(payload: SignUpPayload) {
    const metadata = AuthMapper.toSupabaseMetadata(payload);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: metadata
      }
    });

    if (authError) {
      handleAuthError(authError, 'signUp');
    }

    if (!authData.user) {
      throw new Error('Erro ao criar usuário de autenticação.');
    }

    return authData;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) handleAuthError(error, 'signOut');
  }

  static async getSession() {
    return await supabase.auth.getSession();
  }

  static async isAuthenticated() {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  }

  static async subscribeToAuthChanges(
    callback: (session: Session | null) => void
  ) {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }

  static async completeFirstAccess({
    newPassword,
    userId,
    orgId
  }: {
    newPassword: string;
    userId: string;
    orgId: string;
  }) {
    const { error: authError } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (authError) handleAuthError(authError, 'completeFirstAccess');

    const { error: dbError } = await supabase.rpc('confirm_first_access', {
      p_user_id: userId,
      p_organization_id: orgId
    });
    if (dbError) handleAuthError(dbError, 'completeFirstAccess');
  }
}
