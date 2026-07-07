import { useEffect, useMemo, useState } from 'react';

import { debounce } from '@/shared/utils';

import type { CatalogItem } from '../../../../domain/entities';
import { useUpdateCatalogItemPriceMutation } from '../../../hooks/use-mutations';

interface PendingPrice {
  price: number;
  originalPrice?: number;
}

export function useCurationItem(item: CatalogItem, catalogId: string) {
  const [price, setPrice] = useState(item.price);
  const [originalPrice, setOriginalPrice] = useState(item.originalPrice);
  const { mutate, isPending } = useUpdateCatalogItemPriceMutation(catalogId);

  useEffect(() => {
    setPrice(item.price);
    setOriginalPrice(item.originalPrice);
  }, [item.price, item.originalPrice]);

  const debouncedSave = useMemo(
    () =>
      debounce((payload: unknown) => {
        const next = payload as PendingPrice;

        if (next.price > 0) {
          mutate({
            id: item.id,
            price: next.price,
            originalPrice: next.originalPrice
          });
        }
      }, 600),
    [item.id, mutate]
  );

  function handlePriceChange(value: number) {
    setPrice(value);
    debouncedSave({ price: value, originalPrice });
  }

  function handleOriginalPriceChange(value: number | undefined) {
    setOriginalPrice(value);
    debouncedSave({ price, originalPrice: value });
  }

  return {
    price,
    originalPrice,
    isSaving: isPending,
    needsPrice: item.price <= 0,
    handlePriceChange,
    handleOriginalPriceChange
  };
}
