import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.suppressErrorToast) return;

      const customMessage = query.meta?.errorMessage;
      const backendMessage = error.message ?? 'Erro desconhecido';

      toast.error(customMessage || `Erro na operação: ${backendMessage}`, {
        duration: 7000
      });
    },
    onSuccess: (_data, query) => {
      if (query.meta?.successMessage) {
        toast.success(query.meta.successMessage, { duration: 4000 });
      }
    }
  }),

  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.suppressErrorToast) return;

      const customMessage = mutation.meta?.errorMessage;
      const backendMessage = error.message ?? 'Erro desconhecido';

      toast.error(customMessage || `Erro na operação: ${backendMessage}`, {
        duration: 7000
      });
    },

    onSuccess: (data, _variables, _context, mutation) => {
      const successMessage = mutation.meta?.successMessage;

      if (!successMessage) return;

      // successMessage pode ser estático ou uma função do dado retornado,
      // permitindo mensagens dinâmicas (ex.: "N produto(s) importado(s).").
      const message =
        typeof successMessage === 'function'
          ? successMessage(data)
          : successMessage;

      if (message) {
        toast.success(message, { duration: 4000 });
      }
    }
  }),

  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
});
