import { useMemo, useState } from 'react';

import type { AvailableProduct } from '../../../../hooks/use-queries';
import { useAvailableProductsQuery } from '../../../../hooks/use-queries';

export function useAddProducts(catalogId: string) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { data: products, isLoading } = useAvailableProductsQuery(catalogId);

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

  /** Objetos completos dos produtos selecionados (para o Dialog) */
  const selectedProducts = useMemo((): AvailableProduct[] => {
    if (!products) return [];
    return products.filter((p) => selectedIds.has(p.id));
  }, [products, selectedIds]);

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

  /** Limpa a seleção após adição bem-sucedida */
  function clearSelection() {
    setSelectedIds(new Set());
  }

  return {
    search,
    setSearch,
    products: filteredProducts,
    isLoading,
    selectedIds,
    selectedProducts,
    selectedCount: selectedIds.size,
    toggleProduct,
    clearSelection
  };
}
