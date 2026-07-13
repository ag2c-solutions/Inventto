import type { PostgrestError } from '@supabase/supabase-js';

import { isPostgrestError } from '@/infra/supabase/guards/is-postgres-error';

export function handleDashboardError(
  error: PostgrestError | Error | unknown,
  action: string
): never {
  let message = 'Ocorreu um erro inesperado ao carregar o dashboard.';

  if (isPostgrestError(error)) {
    if (error.code === '42501') {
      message = 'Você não tem permissão para acessar estes dados.';
    } else if (error.message.toLowerCase().includes('network')) {
      message = 'Erro de conexão. Verifique sua internet.';
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  throw new Error(`Erro ao executar ${action}: ${message}`);
}
