import type { PostgrestError } from '@supabase/supabase-js';

export function handleCategoryError(error: unknown, operation?: string): never {
  if (operation) {
    console.error(`[CategoryApi.${operation}]`, error);
  }

  const pgError = error as PostgrestError;
  const code = pgError?.code;
  const message = pgError?.message?.toLowerCase() ?? '';

  if (code === '23505') {
    throw new Error('Já existe uma categoria com este nome.');
  }

  if (message.includes('network')) {
    throw new Error('Erro de conexão. Verifique sua internet.');
  }

  throw new Error('Não foi possível realizar a operação. Tente novamente.');
}
