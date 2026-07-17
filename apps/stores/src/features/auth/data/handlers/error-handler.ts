import type { AuthError } from '@supabase/supabase-js';

import { isPostgrestError } from '@/infra/supabase';

import { EMAIL_NOT_CONFIRMED_ERROR } from '../../domain/constants';

export function handleAuthError(
  error: AuthError | Error | unknown,
  action: string
): never {
  console.error(`Erro em Auth Service [${action}]:`, error);

  if (isPostgrestError(error)) {
    if (error.code === '23505')
      throw new Error('Registro duplicado. Esta operação já foi realizada.');
    if (error.code === '42501')
      throw new Error('Permissão negada para realizar esta operação.');

    throw new Error(error.message || 'Erro no banco de dados.');
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('invalid login credentials'))
      throw new Error('E-mail ou senha incorretos.');
    if (message.includes('email not confirmed'))
      throw new Error(EMAIL_NOT_CONFIRMED_ERROR);
    if (message.includes('user already registered'))
      throw new Error('Este e-mail já está em uso.');
    if (
      message.includes('otp expired') ||
      message.includes('token has expired')
    )
      throw new Error('O código expirou. Solicite um novo código.');
    if (
      (message.includes('otp') && !message.includes('expired')) ||
      message.includes('invalid token')
    )
      throw new Error('Código inválido. Verifique e tente novamente.');
    if (message.includes('password should be at least'))
      throw new Error('A senha é muito fraca. Escolha uma senha mais forte.');
    if (message.includes('should be different'))
      throw new Error('A nova senha deve ser diferente da senha atual.');
    if (message.includes('auth session missing'))
      throw new Error('Sessão expirada ou inválida. Tente novamente.');
    if (message.includes('rate limit'))
      throw new Error(
        'Muitas tentativas. Aguarde um momento e tente novamente.'
      );
    if (message.includes('network'))
      throw new Error('Erro de conexão. Verifique sua internet.');

    const status = (error as AuthError).status;
    if (status === 500 || status === 502)
      throw new Error(
        'Serviço de autenticação indisponível. Tente mais tarde.'
      );

    throw new Error(error.message || 'Erro desconhecido na autenticação.');
  }

  throw new Error('Ocorreu um erro inesperado na autenticação.');
}
