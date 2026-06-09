import { supabase } from '@/infra/supabase';

import type { Session } from '../../domain/entities';
import type {
  ResendOtpPayload,
  SignInPayload,
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
      // handleAuthError distingue "email not confirmed" (conta pendente de OTP)
      // de credencial inválida neutra (RN002), evitando mascaramento.
      handleAuthError(error, 'signIn');
    }

    return data;
  }

  /**
   * Cria a conta pendente de verificação e dispara o código OTP por e-mail.
   * Não retorna sessão ativa — o usuário precisa confirmar o código (verifyOtp)
   * para ativar a conta.
   */
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

    // Conta criada no estado pendente; sessão ainda não está ativa.
    // A sessão só é emitida após verifyOtp confirmar o código.
    return { user: authData.user };
  }

  /**
   * Confirma o código OTP enviado ao e-mail e ativa a conta.
   * Usa type: 'signup' para o fluxo de confirmação de cadastro.
   * Para login condicional (conta pendente tentando logar), o type
   * correto precisa ser validado via supabase start — ver AUTH-03.
   */
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

  /**
   * Reenvia o código OTP de confirmação de cadastro.
   * A UI controla o cooldown de 45s após chamar este método.
   */
  static async resendOtp({ email }: ResendOtpPayload) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    });

    if (error) {
      handleAuthError(error, 'resendOtp');
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
