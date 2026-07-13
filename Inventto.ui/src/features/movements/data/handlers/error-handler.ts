import { isPostgrestError } from '@/infra/supabase/guards/is-postgres-error';

export function handleMovementError(error: unknown, operation: string): never {
  console.error(`Erro em Movement Service [${operation}]:`, error);

  if (isPostgrestError(error)) {
    if (error.code === '42501') {
      throw new Error(
        'Você não tem permissão para realizar movimentações de estoque.'
      );
    }

    if (error.code === '23503') {
      throw new Error(
        'O produto ou variação selecionado não foi encontrado no sistema.'
      );
    }

    if (error.code === '23514') {
      throw new Error('A operação viola uma regra de validação de estoque.');
    }

    if (error.code === '23502') {
      throw new Error('Dados obrigatórios da movimentação estão faltando.');
    }

    if (error.code === 'P0001') {
      const message = error.message?.toLowerCase() || '';

      if (
        message.includes('insufficient stock') ||
        message.includes('estoque negativo')
      ) {
        throw new Error(
          'A operação resultaria em estoque negativo (não permitido).'
        );
      }

      // Marcador do cancel_confirmed_sale (MOV-06): venda já foi estornada
      // ou o pedido não está mais confirmado.
      if (message.includes('order_invalid_transition')) {
        throw new Error(
          'Esta venda já foi estornada ou não está mais confirmada.'
        );
      }

      throw new Error(
        error.message || 'Erro de regra de negócio no banco de dados.'
      );
    }

    if (error.message?.toLowerCase().includes('network')) {
      throw new Error('Erro de conexão. Verifique sua internet.');
    }

    throw new Error(
      error.message || 'Ocorreu um erro inesperado ao processar a movimentação.'
    );
  }

  if (error instanceof Error) {
    throw new Error(error.message);
  }

  throw new Error('Ocorreu um erro inesperado ao processar a movimentação.');
}
