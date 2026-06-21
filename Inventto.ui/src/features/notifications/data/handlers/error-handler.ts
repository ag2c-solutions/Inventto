import { isPostgrestError } from '@/infra/supabase/guards/is-postgres-error';

export const handleNotificationError = (
  error: unknown,
  context: string
): never => {
  if (isPostgrestError(error)) {
    throw new Error(`Erro de notificação (${context}): ${error.message}`);
  }

  if (error instanceof Error) {
    throw new Error(`Erro de notificação (${context}): ${error.message}`);
  }

  throw new Error(`Erro desconhecido em notificação (${context})`);
};
