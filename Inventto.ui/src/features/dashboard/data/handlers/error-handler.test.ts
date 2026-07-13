import { type PostgrestError } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

import { handleDashboardError } from './error-handler';

describe('handleDashboardError', () => {
  it('should throw a permission error for code 42501', () => {
    const error = {
      code: '42501',
      message: 'Permission denied',
      details: ''
    } as PostgrestError;

    expect(() => handleDashboardError(error, 'test')).toThrow(
      'Erro ao executar test: Você não tem permissão para acessar estes dados.'
    );
  });

  it('should throw a connection error when the message mentions network', () => {
    const error = {
      code: '500',
      message: 'Network request failed',
      details: ''
    } as PostgrestError;

    expect(() => handleDashboardError(error, 'test')).toThrow(
      'Erro ao executar test: Erro de conexão. Verifique sua internet.'
    );
  });

  it('should throw a wrapped error for a generic Error instance', () => {
    expect(() =>
      handleDashboardError(new Error('Falha inesperada'), 'test')
    ).toThrow('Erro ao executar test: Falha inesperada');
  });

  it('should throw a generic message for an unknown error shape', () => {
    expect(() => handleDashboardError('string error', 'test')).toThrow(
      'Erro ao executar test: Ocorreu um erro inesperado ao carregar o dashboard.'
    );
  });
});
