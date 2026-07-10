import { type PostgrestError } from '@supabase/supabase-js';

import { isPostgrestError } from '@/infra/supabase/guards/is-postgres-error';

export function handlePdvError(
  error: PostgrestError | Error | unknown,
  action: string
): never {
  console.error(`Erro em PDV Service [${action}]:`, error);

  if (isPostgrestError(error)) {
    if (error.code === '42501') {
      throw new Error('Você não tem permissão para realizar esta ação.');
    }

    if (error.message.toLowerCase().includes('network')) {
      throw new Error('Erro de conexão. Verifique sua internet.');
    }
  }

  if (error instanceof Error) {
    throw new Error(error.message);
  }

  throw new Error('Ocorreu um erro inesperado no balcão de vendas.');
}
