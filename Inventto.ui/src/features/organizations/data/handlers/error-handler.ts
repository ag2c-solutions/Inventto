import { isPostgrestError } from '@/infra/supabase/supabase.utils';

export function handleOrganizationError(error: unknown, action: string): never {
  console.error(`OrganizationService.${action}:`, error);

  if (isPostgrestError(error)) {
    switch (error.code) {
      case '42501':
        throw new Error('Você não tem permissão para realizar esta ação.');

      case '23505':
        if (error.details?.includes('slug')) {
          throw new Error('Este endereço (URL) já está em uso.');
        }
        throw new Error('Este registro já existe no sistema.');

      case '23514':
        throw new Error('Os dados enviados não atendem aos requisitos.');
    }
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error('Ocorreu um erro inesperado.');
}
