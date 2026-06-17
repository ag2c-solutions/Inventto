import { supabase } from '@/infra/supabase';

import type { AuthChangeEvent, Session } from '../../domain/entities';
import type {
  ConfirmFirstAccessPayload,
  RecoverPasswordPayload,
  ResendOtpPayload,
  ResetPasswordPayload,
  SignInPayload,
  signUpFirstAccess,
  SignUpPayload,
  VerifyOtpPayload
} from '../dtos';
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

    return { user: authData.user };
  }

  static async verifyOtp({ email, token }: VerifyOtpPayload) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    });

    if (error) {
      handleAuthError(error, 'verifyOtp');
    }

    return data;
  }

  static async resendOtp({ email }: ResendOtpPayload) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    });

    if (error) {
      handleAuthError(error, 'resendOtp');
    }
  }

  static async recoverPassword({ email }: RecoverPasswordPayload) {
    // O e-mail de recovery entrega um código OTP (template recovery.html),
    // não um magic link — por isso não há redirectTo.
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      handleAuthError(error, 'recoverPassword');
    }
  }

  static async verifyRecoveryOtp({ email, token }: VerifyOtpPayload) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery'
    });

    if (error) {
      handleAuthError(error, 'verifyRecoveryOtp');
    }

    return data;
  }

  static async resetPassword({ newPassword }: ResetPasswordPayload) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      handleAuthError(error, 'resetPassword');
    }
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) handleAuthError(error, 'signOut');
  }

  static async getSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      handleAuthError(error, 'getSession');
    }

    if (!data.session) {
      return null;
    }

    return data.session;
  }

  static async isAuthenticated() {
    const session = await this.getSession();
    return !!session;
  }

  static async subscribeToAuthChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }

  static async signUpFirstAccess({ email }: signUpFirstAccess) {
    const { error: otpError } = await supabase.auth.resend({
      type: 'signup',
      email
    });
    if (otpError) handleAuthError(otpError, 'signUpFirstAccess');
  }

  static async confirmFirstAccess({
    userId,
    orgId
  }: ConfirmFirstAccessPayload) {
    const { error: dbError } = await supabase.rpc('confirm_first_access', {
      p_user_id: userId,
      p_organization_id: orgId
    });

    if (dbError) handleAuthError(dbError, 'confirmFirstAccess');
  }
}
