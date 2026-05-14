import { describe, expect, it } from 'vitest';

import { validateEnv } from './index';

const VALID_RAW = {
  VITE_SUPABASE_URL: 'https://supabase.example.com',
  VITE_SUPABASE_ANON_KEY: 'anon-key-123',
  VITE_CLOUDINARY_NAME: 'my-cloud',
  VITE_CLOUDINARY_PRESET_NAME: 'my-preset',
  VITE_API_BASE_URL: 'https://api.example.com'
};

describe('validateEnv', () => {
  it('deve validar e retornar o env tipado quando todas as variáveis estão presentes', () => {
    const result = validateEnv(VALID_RAW);

    expect(result.supabase.url).toBe(VALID_RAW.VITE_SUPABASE_URL);
    expect(result.supabase.anonKey).toBe(VALID_RAW.VITE_SUPABASE_ANON_KEY);
    expect(result.cloudinary.cloudName).toBe(VALID_RAW.VITE_CLOUDINARY_NAME);
    expect(result.cloudinary.presetName).toBe(
      VALID_RAW.VITE_CLOUDINARY_PRESET_NAME
    );
    expect(result.api.baseUrl).toBe(VALID_RAW.VITE_API_BASE_URL);
  });

  it('deve lançar um erro com prefixo [env] quando há variáveis inválidas', () => {
    expect(() => validateEnv({ ...VALID_RAW, VITE_SUPABASE_URL: '' })).toThrow(
      '[env]'
    );
  });

  it('deve listar supabase.url na mensagem de erro quando VITE_SUPABASE_URL está vazia', () => {
    expect(() => validateEnv({ ...VALID_RAW, VITE_SUPABASE_URL: '' })).toThrow(
      'supabase.url'
    );
  });

  it('deve listar supabase.anonKey na mensagem de erro quando VITE_SUPABASE_ANON_KEY está vazia', () => {
    expect(() =>
      validateEnv({ ...VALID_RAW, VITE_SUPABASE_ANON_KEY: '' })
    ).toThrow('supabase.anonKey');
  });

  it('deve listar api.baseUrl na mensagem de erro quando VITE_API_BASE_URL está ausente', () => {
    expect(() => validateEnv({ ...VALID_RAW, VITE_API_BASE_URL: '' })).toThrow(
      'api.baseUrl'
    );
  });

  it('deve listar cloudinary.cloudName na mensagem de erro quando VITE_CLOUDINARY_NAME está ausente', () => {
    expect(() =>
      validateEnv({ ...VALID_RAW, VITE_CLOUDINARY_NAME: '' })
    ).toThrow('cloudinary.cloudName');
  });

  it('deve listar cloudinary.presetName na mensagem de erro quando VITE_CLOUDINARY_PRESET_NAME está ausente', () => {
    expect(() =>
      validateEnv({ ...VALID_RAW, VITE_CLOUDINARY_PRESET_NAME: '' })
    ).toThrow('cloudinary.presetName');
  });

  it('deve acumular todos os erros em uma única mensagem quando múltiplas variáveis estão ausentes', () => {
    const fn = () =>
      validateEnv({
        VITE_SUPABASE_URL: '',
        VITE_SUPABASE_ANON_KEY: '',
        VITE_CLOUDINARY_NAME: '',
        VITE_CLOUDINARY_PRESET_NAME: '',
        VITE_API_BASE_URL: ''
      });

    expect(fn).toThrow('supabase.url');
    expect(fn).toThrow('supabase.anonKey');
    expect(fn).toThrow('cloudinary.cloudName');
    expect(fn).toThrow('cloudinary.presetName');
    expect(fn).toThrow('api.baseUrl');
  });

  it('deve rejeitar variável definida como undefined', () => {
    expect(() =>
      validateEnv({ ...VALID_RAW, VITE_SUPABASE_URL: undefined })
    ).toThrow('supabase.url');
  });
});
