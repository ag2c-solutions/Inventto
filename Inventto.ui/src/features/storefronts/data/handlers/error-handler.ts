import { type PostgrestError } from '@supabase/supabase-js';

import { isPostgrestError } from '@/infra/supabase/guards/is-postgres-error';

import {
  StorefrontPrereqsMissingError,
  StorefrontSlugUnavailableError
} from '../../domain/entities';

// Marcador lançado pelo RPC publish_storefront quando faltam pré-requisitos
// (RN075) — mapeado para StorefrontPrereqsMissingError na API, com as
// chaves faltantes codificadas após ":" (ex.: "STOREFRONT_PREREQS_MISSING:whatsapp,hours").
export const PREREQS_MISSING_ERROR_MARKER = 'STOREFRONT_PREREQS_MISSING';

// Marcador lançado pelos RPCs create_storefront/update_storefront (RN072/
// RN073) quando o slug revalidado no servidor não está disponível — mapeado
// para StorefrontSlugUnavailableError, com o motivo após ":" (ex.:
// "STOREFRONT_SLUG_UNAVAILABLE:taken").
export const SLUG_UNAVAILABLE_ERROR_MARKER = 'STOREFRONT_SLUG_UNAVAILABLE';

export function handleStorefrontError(
  error: PostgrestError | Error | unknown,
  action: string
): never {
  console.error(`Erro em Storefront Service [${action}]:`, error);

  if (
    error instanceof StorefrontPrereqsMissingError ||
    error instanceof StorefrontSlugUnavailableError
  ) {
    throw error;
  }

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
