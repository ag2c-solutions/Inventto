import { useEffect, useMemo, useState } from 'react';

import { formatVariantOptions, type IProduct } from '@/features/products';

import type { MovementFormData } from '../../schema';
import { getMovementItemImage } from '../../utils';

import { parseMoneyInput } from './format-money';

type FormItem = MovementFormData['items'][number];

interface UseAddItemsProps {
  product: IProduct | null;
  isOpen: boolean;
  isWithdrawal: boolean;
  editingItem: FormItem | null;
  existingItems: FormItem[];
  onConfirm: (items: FormItem[]) => void;
}

const keyFor = (variantId: string | null | undefined, productId: string) =>
  variantId || productId;

export function useAddItems({
  product,
  isOpen,
  isWithdrawal,
  editingItem,
  existingItems,
  onConfirm
}: UseAddItemsProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [values, setValues] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isOpen || !product) {
      setQuantities({});
      setValues({});
      return;
    }

    if (editingItem) {
      const key = keyFor(editingItem.variantId, product.id);

      setQuantities({ [key]: editingItem.quantity });
      setValues({
        [key]: isWithdrawal ? editingItem.unitPrice : editingItem.unitCost
      });
      return;
    }

    setQuantities({});
    setValues({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product, editingItem]);

  const getExistingQty = (variantId: string | null) => {
    if (!product) return 0;
    return existingItems
      .filter(
        (item) => item.productId === product.id && item.variantId === variantId
      )
      .reduce((acc, item) => acc + item.quantity, 0);
  };

  const getAvailableStock = (variantId: string | null, stock: number) =>
    Math.max(0, stock - getExistingQty(variantId));

  const rows = useMemo(() => {
    if (!product) return [];

    if (product.hasVariants && product.variants) {
      return product.variants.map((variant) => ({
        key: variant.id,
        variantId: variant.id as string | null,
        stock: variant.stock ?? 0
      }));
    }

    return [{ key: product.id, variantId: null, stock: product.stock ?? 0 }];
  }, [product]);

  const invalidKeys = useMemo(() => {
    const keys = new Set<string>();
    if (!isWithdrawal) return keys;

    for (const row of rows) {
      const qty = quantities[row.key] || 0;
      if (qty <= 0) continue;

      const availableStock = getAvailableStock(row.variantId, row.stock);
      if (qty > availableStock) keys.add(row.key);
    }

    return keys;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWithdrawal, rows, quantities, existingItems]);

  const handleQuantityChange = (key: string, value: string) => {
    let qty = Number.parseInt(value);
    if (isNaN(qty) || qty < 0) qty = 0;

    setQuantities((prev) => ({ ...prev, [key]: qty }));
  };

  const handleValueChange = (key: string, rawValue: string) => {
    setValues((prev) => ({ ...prev, [key]: parseMoneyInput(rawValue) }));
  };

  const handleAdd = () => {
    if (!product || invalidKeys.size > 0) return;

    let itemsToAdd: FormItem[] = [];

    if (product.hasVariants && product.variants) {
      itemsToAdd = product.variants
        .filter((v) => (quantities[v.id || ''] || 0) > 0)
        .map((v) => ({
          productId: product.id,
          productName: product.name,
          productImage: getMovementItemImage(product, v.id),
          sku: v.sku,

          variantId: v.id,
          variantName: formatVariantOptions(v.options),
          variantOptions: v.options,
          currentStock: v.stock ?? 0,
          quantity: quantities[v.id || ''],

          unitCost: isWithdrawal ? (v.costPrice ?? 0) : (values[v.id] ?? 0),
          unitPrice: isWithdrawal ? (values[v.id] ?? 0) : 0
        }));
    } else {
      const qty = quantities[product.id] || 0;
      if (qty > 0) {
        itemsToAdd = [
          {
            productId: product.id,
            productName: product.name,
            productImage: getMovementItemImage(product, null),
            sku: product.sku,

            currentStock: product.stock ?? 0,
            quantity: qty,

            variantId: null,
            variantName: undefined,

            unitCost: isWithdrawal
              ? (product.costPrice ?? 0)
              : (values[product.id] ?? 0),
            unitPrice: isWithdrawal ? (values[product.id] ?? 0) : 0
          }
        ];
      }
    }

    onConfirm(itemsToAdd);
  };

  const filledCount = Object.values(quantities).filter((qty) => qty > 0).length;

  return {
    quantities,
    values,
    filledCount,
    invalidKeys,
    getAvailableStock,
    handleQuantityChange,
    handleValueChange,
    handleAdd
  };
}
