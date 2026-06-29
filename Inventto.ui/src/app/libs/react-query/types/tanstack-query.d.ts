import '@tanstack/react-query';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      errorMessage?: string;
      // string estática ou função do dado retornado (mensagem dinâmica)
      successMessage?: string | ((data: unknown) => string);
      suppressErrorToast?: boolean;
    };
    queryMeta: {
      errorMessage?: string;
      successMessage?: string;
      suppressErrorToast?: boolean;
    };
  }
}
