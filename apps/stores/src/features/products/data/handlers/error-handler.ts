import { type PostgrestError } from '@supabase/supabase-js';

import { isPostgrestError } from '@/infra/supabase/guards/is-postgres-error';

export function handleProductError(
  error: PostgrestError | Error | unknown,
  action: string
): never {
  if (isPostgrestError(error)) {
    if (error.code === '23505') {
      throw new Error(
        `Erro ao executar ${action}: Já existe um produto cadastrado com este Nome ou SKU.`
      );
    }

    if (error.code === '23503') {
      throw new Error(
        `Erro ao executar ${action}: A categoria selecionada não foi encontrada ou é inválida.`
      );
    }

    if (error.code === '42501') {
      throw new Error(
        `Erro ao executar ${action}: Você não tem permissão para realizar alterações no catálogo de produtos.`
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
