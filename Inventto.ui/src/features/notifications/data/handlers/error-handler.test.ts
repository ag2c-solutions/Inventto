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

  it('should throw a wrapped error for a Postgrest error', () => {
    const error = {
      code: '42501',
      message: 'Permission denied',
      details: ''
    } as PostgrestError;

    expect(() => handleNotificationError(error, 'test')).toThrow(
      'Erro de notificação (test): Permission denied'
    );
  });

  it('should throw a wrapped error for a generic Error instance', () => {
    expect(() =>
      handleNotificationError(new Error('Falha de rede'), 'test')
    ).toThrow('Erro de notificação (test): Falha de rede');
  });

  it('should throw a generic message for an unknown error shape', () => {
    expect(() => handleNotificationError('string error', 'test')).toThrow(
      'Erro desconhecido em notificação (test)'
    );
  });
});
