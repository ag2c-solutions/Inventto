import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi
} from 'vitest';

import {
  EMAIL_OTHER_TENANT_ERROR,
  handleOrganizationError
} from './error-handler';

const makePostgrestError = (overrides: {
  code?: string;
  message?: string;
  details?: string;
}) => ({
  code: overrides.code ?? '',
  message: overrides.message ?? 'error',
  details: overrides.details ?? ''
});

describe('handleOrganizationError', () => {
  let consoleSpy: MockInstance;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('deve lançar "permissão" para código Postgrest 42501', () => {
    const error = makePostgrestError({ code: '42501' });
    expect(() => handleOrganizationError(error, 'test')).toThrow(
      'Você não tem permissão para realizar esta ação.'
    );
  });

  it('deve lançar "endereço em uso" para código 23505 quando details contém slug', () => {
    const error = makePostgrestError({
      code: '23505',
      details: 'slug_unique_key'
    });
    expect(() => handleOrganizationError(error, 'test')).toThrow(
      'Este endereço (URL) já está em uso.'
    );
  });

  it('deve lançar "registro já existe" para código 23505 quando details não contém slug', () => {
    const error = makePostgrestError({
      code: '23505',
      details: 'name_unique_key'
    });
    expect(() => handleOrganizationError(error, 'test')).toThrow(
      'Este registro já existe no sistema.'
    );
  });

  it('deve lançar "dados inválidos" para código Postgrest 23514', () => {
    const error = makePostgrestError({ code: '23514' });
    expect(() => handleOrganizationError(error, 'test')).toThrow(
      'Os dados enviados não atendem aos requisitos.'
    );
  });

  it('deve relançar o Error original para instâncias de Error comuns', () => {
    const originalError = new Error('Algo deu errado');
    expect(() => handleOrganizationError(originalError, 'test')).toThrow(
      'Algo deu errado'
    );
  });

  it('deve lançar mensagem genérica para tipos desconhecidos', () => {
    expect(() =>
      handleOrganizationError('string desconhecida', 'test')
    ).toThrow('Ocorreu um erro inesperado.');
  });

  it('deve mapear "user already registered" no createMember para o discriminador de outro negócio (RN034)', () => {
    const error = new Error('User already registered');
    expect(() => handleOrganizationError(error, 'createMember')).toThrow(
      EMAIL_OTHER_TENANT_ERROR
    );
  });

  it('não aplica o discriminador de outro negócio fora do createMember', () => {
    const error = new Error('User already registered');
    expect(() => handleOrganizationError(error, 'replicateMember')).toThrow(
      'User already registered'
    );
  });

  it('deve chamar console.error com o prefixo padronizado em todos os casos', () => {
    const error = makePostgrestError({ code: '42501' });
    expect(() => handleOrganizationError(error, 'getById')).toThrow();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Erro em Organization Service [getById]:',
      error
    );
  });
});
