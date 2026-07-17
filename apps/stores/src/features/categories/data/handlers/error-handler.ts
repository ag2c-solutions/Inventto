import type { PostgrestError } from '@supabase/supabase-js';

import { isPostgrestError } from '@/infra/supabase/guards/is-postgres-error';

export function handleCategoryError(
  error: PostgrestError | Error | unknown,
  action: string
): never {
  console.error(`Erro em Category Service [${action}]:`, error);

  if (isPostgrestError(error)) {
    if (error.code === '23505') {
      throw new Error('Já existe uma categoria com este nome.');
    }

    if (error.message.toLowerCase().includes('network')) {
      throw new Error('Erro de conexão. Verifique sua internet.');
    }
  }

  if (error instanceof Error) {
    throw new Error(error.message);
  }

  throw new Error('Não foi possível realizar a operação. Tente novamente.');
}
