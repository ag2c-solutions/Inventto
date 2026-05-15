export const CATALOG_KEYS = {
  all: ['catalogs'] as const,
  detail: (id: string) => ['catalogs', 'detail', id] as const,
  slugAvailability: (slug: string) =>
    ['catalogs', 'slug-availability', slug] as const
} as const;
