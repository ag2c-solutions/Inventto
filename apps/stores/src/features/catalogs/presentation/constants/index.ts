export const CATALOG_KEYS = {
  all: ['catalogs'] as const,
  detail: (id: string) => ['catalogs', 'detail', id] as const,
  items: (catalogId: string) => ['catalogs', catalogId, 'items'] as const
} as const;
