import { type PostgrestError } from '@supabase/supabase-js';

import { isPostgrestError } from '@/infra/supabase/guards/is-postgres-error';

export function handleStorefrontError(
  error: PostgrestError | Error | unknown,
  action: string
): never {
  console.error(`Erro em Storefront Service [${action}]:`, error);

  if (isPostgrestError(error)) {
    if (error.code === '23505') {
      throw new Error('Já existe uma vitrine com estes dados.');
    }

    if (error.code === '42501') {
      throw new Error(
        'Você não tem permissão para realizar alterações nas vitrines.'
      );
    }

    if (error.message.toLowerCase().includes('network')) {
      throw new Error('Erro de conexão. Verifique sua internet.');
    }
  }

  if (error instanceof Error) {
    throw new Error(error.message);
  }

  throw new Error('Ocorreu um erro inesperado ao processar a vitrine.');
}
