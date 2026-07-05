import { isPostgrestError } from '@/infra/supabase/guards/is-postgres-error';

// Discriminador de controle de fluxo (RN034/RN007): o e-mail informado já
// pertence a um usuário de OUTRO negócio (não é candidato do tenant atual,
// senão teria entrado pelo fluxo de replicação). O form trata como erro inline
// no campo e-mail, não como toast genérico.
// Mantenha este valor em sincronia com `domain/services/index.ts` — o
// domínio expõe o mesmo identificador para presentation comparar sem
// importar `data/` diretamente (boundary entre camadas).
export const EMAIL_OTHER_TENANT_ERROR = 'EMAIL_OTHER_TENANT';

export function handleOrganizationError(error: unknown, action: string): never {
  console.error(`Erro em Organization Service [${action}]:`, error);

  if (
    action === 'createMember' &&
    error instanceof Error &&
    error.message.toLowerCase().includes('user already registered')
  ) {
    throw new Error(EMAIL_OTHER_TENANT_ERROR);
  }

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
