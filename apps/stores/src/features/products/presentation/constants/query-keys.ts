export const PRODUCTS_KEYS = {
  all: ['products'] as const,
  list: (organizationId?: string | null) =>
    [...PRODUCTS_KEYS.all, 'list', organizationId] as const,
  detail: (productId?: string | null) =>
    [...PRODUCTS_KEYS.all, 'detail', productId] as const,
  skuAvailability: (
    organizationId?: string | null,
    sku?: string | null,
    excludeProductId?: string | null
  ) =>
    [
      ...PRODUCTS_KEYS.all,
      'sku-availability',
      organizationId,
      sku,
      excludeProductId ?? null
    ] as const,
  globalAttributes: ['products', 'global-attributes'] as const,
  importCandidates: (
    targetOrganizationId?: string | null,
    sourceOrganizationId?: string | null
  ) =>
    [
      ...PRODUCTS_KEYS.all,
      'import-candidates',
      targetOrganizationId,
      sourceOrganizationId
    ] as const,
  sourceVariants: (
    sourceOrganizationId?: string | null,
    productId?: string | null
  ) =>
    [
      ...PRODUCTS_KEYS.all,
      'source-variants',
      sourceOrganizationId,
      productId
    ] as const
};
