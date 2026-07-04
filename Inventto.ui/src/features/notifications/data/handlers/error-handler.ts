import { type PostgrestError } from '@supabase/supabase-js';

import { isPostgrestError } from '@/infra/supabase/guards/is-postgres-error';

export function handleNotificationError(
  error: PostgrestError | Error | unknown,
  action: string
): never {
  console.error(`Erro em Notification Service [${action}]:`, error);

  if (isPostgrestError(error)) {
    if (error.code === '42501') {
      throw new Error(
        `Erro ao executar ${action}: Você não tem permissão para acessar as notificações.`
      );
    }

    if (error.message.toLowerCase().includes('network')) {
      throw new Error(
        `Erro ao executar ${action}: Erro de conexão. Verifique sua internet.`
      );
    }
  }

  if (error instanceof Error) {
    throw new Error(`Erro ao executar ${action}: ${error.message}`);
  }

  throw new Error(`Erro ao executar ${action}: Ocorreu um erro inesperado.`);
}
