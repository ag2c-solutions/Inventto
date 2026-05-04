import { type PostgrestError } from '@supabase/supabase-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handleMovementError } from './error-handler';

describe('handleMovementError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw specific error for permission denied (42501)', () => {
    const error = {
      code: '42501',
      message: 'Permission denied',
      details: ''
    } as PostgrestError;

    expect(() => handleMovementError(error, 'test')).toThrow(
      'Você não tem permissão para realizar movimentações de estoque.'
    );
  });

  it('should throw specific error for foreign key violation (23503)', () => {
    const error = {
      code: '23503',
      message: 'Foreign key violation',
      details: ''
    } as PostgrestError;

    expect(() => handleMovementError(error, 'test')).toThrow(
      'O produto ou variação selecionado não foi encontrado no sistema.'
    );
  });

  it('should throw "check violation" error for 23514', () => {
    const error = {
      code: '23514',
      message: 'check violation',
      details: ''
    } as PostgrestError;

    expect(() => handleMovementError(error, 'test')).toThrow(
      'A operação viola uma regra de validação de estoque.'
    );
  });

  it('should throw "dados obrigatórios" error for 23502', () => {
    const error = {
      code: '23502',
      message: 'not null violation',
      details: ''
    } as PostgrestError;

    expect(() => handleMovementError(error, 'test')).toThrow(
      'Dados obrigatórios da movimentação estão faltando.'
    );
  });

  it('should throw "estoque negativo" for P0001 with insufficient stock message', () => {
    const error = {
      code: 'P0001',
      message: 'insufficient stock available',
      details: ''
    } as PostgrestError;

    expect(() => handleMovementError(error, 'test')).toThrow(
      'A operação resultaria em estoque negativo (não permitido).'
    );
  });

  it('should throw the raw message for P0001 with other business rule messages', () => {
    const error = {
      code: 'P0001',
      message: 'Custom database exception',
      details: ''
    } as PostgrestError;

    expect(() => handleMovementError(error, 'test')).toThrow(
      'Custom database exception'
    );
  });

  it('should detect network errors based on message content', () => {
    const error = {
      code: '',
      message: 'Network request failed',
      details: ''
    } as PostgrestError;

    expect(() => handleMovementError(error, 'test')).toThrow(
      'Erro de conexão. Verifique sua internet.'
    );
  });

  it('should throw the raw message for unknown Postgrest error codes', () => {
    const error = {
      code: 'XXXXX',
      message: 'Some internal DB error',
      details: ''
    } as PostgrestError;

    expect(() => handleMovementError(error, 'test')).toThrow(
      'Some internal DB error'
    );
  });

  it('should rethrow generic JavaScript errors directly', () => {
    expect(() =>
      handleMovementError(new Error('Random failure'), 'test')
    ).toThrow('Random failure');
  });

  it('should throw generic fallback for unknown types', () => {
    expect(() => handleMovementError('unknown string', 'test')).toThrow(
      'Ocorreu um erro inesperado ao processar a movimentação.'
    );
  });
});
