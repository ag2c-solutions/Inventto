import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi
} from 'vitest';

import { handleCategoryError } from './error-handler';

const makePostgrestError = (overrides: {
  code?: string;
  message?: string;
}) => ({
  code: overrides.code ?? '',
  message: overrides.message ?? 'error',
  details: '',
  hint: ''
});

describe('handleCategoryError', () => {
  let consoleSpy: MockInstance;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('deve relançar com "Já existe uma categoria" para erro Postgrest com code 23505', () => {
    const error = makePostgrestError({
      code: '23505',
      message: 'duplicate key'
    });

    expect(() => handleCategoryError(error)).toThrow(
      'Já existe uma categoria com este nome.'
    );
  });

  it('deve relançar com "Erro de conexão" para erro Postgrest com "network" na mensagem', () => {
    const error = makePostgrestError({ message: 'Network request failed' });

    expect(() => handleCategoryError(error)).toThrow(
      'Erro de conexão. Verifique sua internet.'
    );
  });

  it('deve relançar com a mensagem original para instâncias de Error que não sejam Postgrest', () => {
    const error = new Error('Algo deu errado');

    expect(() => handleCategoryError(error)).toThrow('Algo deu errado');
  });

  it('deve relançar com mensagem genérica para tipos de erro desconhecidos', () => {
    expect(() => handleCategoryError({ foo: 'bar' })).toThrow(
      'Não foi possível realizar a operação. Tente novamente.'
    );
  });

  it('deve chamar console.error com o prefixo [CategoryApi.<operation>] quando operation é fornecido', () => {
    const error = makePostgrestError({ code: '23505' });

    expect(() => handleCategoryError(error, 'add')).toThrow();

    expect(consoleSpy).toHaveBeenCalledWith('[CategoryApi.add]', error);
  });

  it('não deve chamar console.error quando operation não é fornecido', () => {
    const error = makePostgrestError({ code: '23505' });

    expect(() => handleCategoryError(error)).toThrow();

    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
