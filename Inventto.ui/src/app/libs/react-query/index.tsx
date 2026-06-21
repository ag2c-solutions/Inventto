import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error('Global Query Error:', error);
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
    onSuccess: (_data, _variables, _context, mutation) => {
      if (mutation.meta?.successMessage) {
        toast.success(mutation.meta.successMessage, { duration: 4000 });
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
