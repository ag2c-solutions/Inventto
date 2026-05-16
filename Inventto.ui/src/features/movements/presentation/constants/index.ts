export const MOVEMENT_KEYS = {
  all: ['movements'] as const,
  list: (organizationId?: string, filters?: { productId?: string }) =>
    [...MOVEMENT_KEYS.all, organizationId, filters] as const
} as const;
