import { type PostgrestError } from '@supabase/supabase-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handleNotificationError } from './error-handler';

describe('handleNotificationError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw a permission error for code 42501', () => {
    const error = {
      code: '42501',
      message: 'Permission denied',
      details: ''
    } as PostgrestError;

    expect(() => handleNotificationError(error, 'test')).toThrow(
      'Erro ao executar test: Você não tem permissão para acessar as notificações.'
    );
  });

  it('should throw a connection error when the message mentions network', () => {
    const error = {
      code: '500',
      message: 'Network request failed',
      details: ''
    } as PostgrestError;

    expect(() => handleNotificationError(error, 'test')).toThrow(
      'Erro ao executar test: Erro de conexão. Verifique sua internet.'
    );
  });

  it('should throw a wrapped error for a generic Error instance', () => {
    expect(() =>
      handleNotificationError(new Error('Falha inesperada'), 'test')
    ).toThrow('Erro ao executar test: Falha inesperada');
  });

  it('should throw a generic message for an unhandled Postgrest error code', () => {
    const error = {
      code: '500',
      message: 'boom',
      details: ''
    } as PostgrestError;

    expect(() => handleNotificationError(error, 'test')).toThrow(
      'Erro ao executar test: Ocorreu um erro inesperado.'
    );
  });

  it('should throw a generic message for an unknown error shape', () => {
    expect(() => handleNotificationError('string error', 'test')).toThrow(
      'Erro ao executar test: Ocorreu um erro inesperado.'
    );
  });
});
