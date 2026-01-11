import { useState, useEffect, useMemo } from 'react';
import type { IProduct } from '@/app/features/products/types/models';
import type { MovementFormData } from '../../schema';
import { getMovementItemImage } from '../../utils';
import { formatVariantOptions } from '@/app/features/products/utils';
import { toast } from 'sonner';

type FormItem = MovementFormData['items'][number];

interface UseAddItemsProps {
  product: IProduct | null;
  isOpen: boolean;
  isWithdrawal: boolean;
  existingItems: FormItem[];
  onConfirm: (items: FormItem[]) => void;
}

export function useAddItems({
  product,
  isOpen,
  isWithdrawal,
  existingItems,
  onConfirm
}: UseAddItemsProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) setQuantities({});
  }, [isOpen, product]);

  const getExistingQty = (variantId: string | null) => {
    if (!product) return 0;
    return existingItems
      .filter(
        (item) => item.productId === product.id && item.variantId === variantId
      )
      .reduce((acc, item) => acc + item.quantity, 0);
  };

  const handleQuantityChange = (
    variantId: string,
    value: string,
    realStock: number
  ) => {
    let qty = Number.parseInt(value);
    if (isNaN(qty) || qty < 0) qty = 0;

    if (isWithdrawal) {
      const qtyInBatch = getExistingQty(
        variantId === product?.id ? null : variantId
      );
      const availableStock = Math.max(0, realStock - qtyInBatch);

      if (qty > availableStock) {
        qty = availableStock;
        toast.warning(
          availableStock === 0
            ? 'Todo o estoque deste item já foi adicionado ao lote.'
            : `Apenas mais ${availableStock} unidades disponíveis.`
        );
      }
    }

    setQuantities((prev) => ({ ...prev, [variantId]: qty }));
  };

  const handleAdd = () => {
    if (!product) return;

    let itemsToAdd: FormItem[] = [];

    if (product.hasVariants && product.variants) {
      itemsToAdd = product.variants
        .filter((v) => (quantities[v.id || ''] || 0) > 0)
        .map((v) => ({
          productId: product.id,
          productName: product.name,
          productImage: getMovementItemImage(product, v.id),

          variantId: v.id,
          variantName: formatVariantOptions(v.options),
          variantOptions: v.options,
          currentStock: v.stock ?? 0,
          quantity: quantities[v.id || ''],

          unitCost: v.costPrice ?? 0,
          unitPrice: 0
        }));
    } else {
      const qty = quantities[product.id] || 0;
      if (qty > 0) {
        itemsToAdd = [
          {
            productId: product.id,
            productName: product.name,
            productImage: getMovementItemImage(product, null),

            currentStock: product.stock ?? 0,
            quantity: qty,

            variantId: null,
            variantName: undefined,

            unitCost: product.costPrice ?? 0,
            unitPrice: 0
          }
        ];
      }
    }

    onConfirm(itemsToAdd);
  };

  const totalQuantity = useMemo(
    () => Object.values(quantities).reduce((a, b) => a + b, 0),
    [quantities]
  );

  return {
    quantities,
    totalQuantity,
    getExistingQty,
    handleQuantityChange,
    handleAdd
  };
}
