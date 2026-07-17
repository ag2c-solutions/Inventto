import { type PostgrestError } from '@supabase/supabase-js';

import { isPostgrestError } from '@/infra/supabase/guards/is-postgres-error';

import { CatalogHasLinkedChannelsError } from '../../domain/entities';

// Marcador lançado pelo RPC delete_catalog quando há canais usando o
// catálogo (RN061) — mapeado para CatalogHasLinkedChannelsError na API.
export const LINKED_CHANNELS_ERROR_MARKER = 'CATALOG_HAS_LINKED_CHANNELS';

export function handleCatalogError(
  error: PostgrestError | Error | unknown,
  action: string
): never {
  console.error(`Erro em Catalog Service [${action}]:`, error);

  if (error instanceof CatalogHasLinkedChannelsError) {
    throw error;
  }

  if (isPostgrestError(error)) {
    if (error.code === '23505') {
      throw new Error('Já existe um catálogo com estes dados.');
    }

    if (error.code === '42501') {
      throw new Error(
        'Você não tem permissão para realizar alterações nos catálogos.'
      );
    }

    if (error.message.toLowerCase().includes('network')) {
      throw new Error('Erro de conexão. Verifique sua internet.');
    }
  }

  if (error instanceof Error) {
    throw new Error(error.message);
  }

  throw new Error('Ocorreu um erro inesperado ao processar o catálogo.');
}
