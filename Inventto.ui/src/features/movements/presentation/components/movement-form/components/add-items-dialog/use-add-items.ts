import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { formatVariantOptions, type IProduct } from '@/features/products';

import type { MovementFormData } from '../../schema';
import { getMovementItemImage } from '../../utils';

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

    if (product.hasVariants && product.variants) {
      const defaults: Record<string, number> = {};

      for (const variant of product.variants) {
        if (!isWithdrawal) {
          defaults[variant.id] = variant.costPrice ?? 0;
        }
      }

      setValues(defaults);
    } else if (!isWithdrawal) {
      setValues({ [product.id]: product.costPrice ?? 0 });
    }

    setQuantities({});
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
            : `Apenas mais ${availableStock} unidades disponíveis.`,
          { duration: 6000 }
        );
      }
    }

    setQuantities((prev) => ({ ...prev, [variantId]: qty }));
  };

  const handleValueChange = (key: string, value: string) => {
    const parsed = Number.parseFloat(value.replace(',', '.'));

    setValues((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
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

  const totalQuantity = useMemo(
    () => Object.values(quantities).reduce((a, b) => a + b, 0),
    [quantities]
  );

  return {
    quantities,
    values,
    totalQuantity,
    getExistingQty,
    handleQuantityChange,
    handleValueChange,
    handleAdd
  };
}
