import { describe, expect, it, vi } from 'vitest';

import { EMAIL_NOT_CONFIRMED_ERROR, handleAuthError } from './error-handler';

const action = 'testAction';

const makeAuthError = (message: string, status?: number) =>
  Object.assign(new Error(message), { status, name: 'AuthError' });

const makePostgrestError = (code: string, message = 'db error') => ({
  code,
  message,
  details: null,
  hint: null
});

describe('handleAuthError', () => {
  it('should throw "E-mail ou senha incorretos" for invalid credentials', () => {
    const error = makeAuthError('Invalid login credentials', 400);
    expect(() => handleAuthError(error, action)).toThrow(
      'E-mail ou senha incorretos.'
    );
  });

  it('should throw the EMAIL_NOT_CONFIRMED discriminator for unconfirmed email', () => {
    const error = makeAuthError('Email not confirmed', 400);
    expect(() => handleAuthError(error, action)).toThrow(
      EMAIL_NOT_CONFIRMED_ERROR
    );
  });

  it('should NOT mask unconfirmed email as invalid credentials', () => {
    const error = makeAuthError('Email not confirmed', 400);
    expect(() => handleAuthError(error, action)).not.toThrow(
      'E-mail ou senha incorretos.'
    );
  });

  it('should throw "Este e-mail já está em uso" for user already registered', () => {
    const error = makeAuthError('User already registered', 400);
    expect(() => handleAuthError(error, action)).toThrow(
      'Este e-mail já está em uso.'
    );
  });

  it('should throw "A senha é muito fraca" for weak password', () => {
    const error = makeAuthError(
      'Password should be at least 6 characters',
      422
    );
    expect(() => handleAuthError(error, action)).toThrow(
      'A senha é muito fraca. Escolha uma senha mais forte.'
    );
  });

  it('should throw "Muitas tentativas" for rate limit error', () => {
    const error = makeAuthError('Rate limit exceeded', 429);
    expect(() => handleAuthError(error, action)).toThrow(
      'Muitas tentativas. Aguarde um momento e tente novamente.'
    );
  });

  it('should throw "Erro de conexão" for network error', () => {
    const error = makeAuthError('Network request failed', 0);
    expect(() => handleAuthError(error, action)).toThrow(
      'Erro de conexão. Verifique sua internet.'
    );
  });

  it('should throw generic service error for 500 status', () => {
    const error = makeAuthError('Database error', 500);
    expect(() => handleAuthError(error, action)).toThrow(
      'Serviço de autenticação indisponível. Tente mais tarde.'
    );
  });

  it('should throw generic service error for 502 status (Bad Gateway)', () => {
    const error = makeAuthError('Bad Gateway', 502);
    expect(() => handleAuthError(error, action)).toThrow(
      'Serviço de autenticação indisponível. Tente mais tarde.'
    );
  });

  it('should throw the original message for unknown errors', () => {
    const error = makeAuthError('Something weird happened', 418);
    expect(() => handleAuthError(error, action)).toThrow(
      'Something weird happened'
    );
  });

  it('should use fallback message when error message is empty', () => {
    const error = makeAuthError('', 400);
    expect(() => handleAuthError(error, action)).toThrow(
      'Erro desconhecido na autenticação.'
    );
  });

  it('should throw duplicate record message for PostgrestError code 23505', () => {
    const error = makePostgrestError('23505');
    expect(() => handleAuthError(error, action)).toThrow(
      'Registro duplicado. Esta operação já foi realizada.'
    );
  });

  it('should throw permission denied message for PostgrestError code 42501', () => {
    const error = makePostgrestError('42501');
    expect(() => handleAuthError(error, action)).toThrow(
      'Permissão negada para realizar esta operação.'
    );
  });

  it('should throw raw db message for unknown PostgrestError code', () => {
    const error = makePostgrestError('99999', 'constraint failed');
    expect(() => handleAuthError(error, action)).toThrow('constraint failed');
  });

  it('should throw generic message for non-Error, non-PostgrestError values', () => {
    expect(() => handleAuthError('string error', action)).toThrow(
      'Ocorreu um erro inesperado na autenticação.'
    );
    expect(() => handleAuthError(null, action)).toThrow(
      'Ocorreu um erro inesperado na autenticação.'
    );
    expect(() => handleAuthError(42, action)).toThrow(
      'Ocorreu um erro inesperado na autenticação.'
    );
  });

  it('should log console.error with action context', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = makeAuthError('some error', 400);

    expect(() => handleAuthError(error, 'signIn')).toThrow();

    expect(spy).toHaveBeenCalledWith('Erro em Auth Service [signIn]:', error);
    spy.mockRestore();
  });
});
