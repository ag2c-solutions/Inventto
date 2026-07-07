import { useMemo, useState } from 'react';

import { useAddCatalogItemsMutation } from '../../../hooks/use-mutations';
import { useAvailableProductsQuery } from '../../../hooks/use-queries';

export function useAddProductsSheet(catalogId: string) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { data: products, isLoading } = useAvailableProductsQuery(catalogId);
  const { mutateAsync, isPending } = useAddCatalogItemsMutation(catalogId);

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    const term = search.trim().toLowerCase();
    if (!term) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term)
    );
  }, [products, search]);

  function toggleProduct(productId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }

      return next;
    });
  }

  async function confirmSelection() {
    await mutateAsync(Array.from(selectedIds));
    setSelectedIds(new Set());
  }

  return {
    search,
    setSearch,
    products: filteredProducts,
    isLoading,
    selectedIds,
    selectedCount: selectedIds.size,
    toggleProduct,
    confirmSelection,
    isConfirming: isPending
  };
}
