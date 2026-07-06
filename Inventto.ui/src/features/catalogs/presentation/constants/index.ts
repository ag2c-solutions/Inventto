export const CATALOG_KEYS = {
  all: ['catalogs'] as const,
  detail: (id: string) => ['catalogs', 'detail', id] as const
} as const;
