import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { IProduct } from '@/features/products';

import type { MovementFormData } from '../../../schema';
import { movementBatchItemFactory } from '../../../schema/batch-item.factory';

import { useAddItems } from './use-add-items';

type FormItem = MovementFormData['items'][number];

const withVariants: IProduct = {
  id: 'prod-1',
  name: 'Camisa Social Algodão',
  sku: 'CS-ALG',
  costPrice: 29,
  stock: 20,
  hasVariants: true,
  variants: [
    {
      id: 'var-1',
      sku: 'CS-ALG-BR-M',
      stock: 12,
      costPrice: 29,
      options: [{ name: 'Cor', value: 'Branco' }]
    },
    {
      id: 'var-2',
      sku: 'CS-ALG-BR-G',
      stock: 8,
      costPrice: 29,
      options: [{ name: 'Cor', value: 'Branco' }]
    }
  ]
} as unknown as IProduct;

const withoutVariants: IProduct = {
  id: 'prod-2',
  name: 'Lenço de Seda Estampado',
  sku: 'LS-EST-03',
  costPrice: 39.9,
  stock: 6,
  hasVariants: false,
  variants: []
} as unknown as IProduct;

function buildProps(
  overrides: Partial<Parameters<typeof useAddItems>[0]> = {}
) {
  return {
    product: withVariants,
    isOpen: true,
    isWithdrawal: false,
    editingItem: null,
    existingItems: [] as FormItem[],
    onConfirm: vi.fn(),
    ...overrides
  };
}

describe('useAddItems', () => {
  it('does not prefill unit cost from the product on open (entry)', () => {
    const { result } = renderHook(() => useAddItems(buildProps()));

    expect(result.current.values['var-1']).toBeUndefined();
    expect(result.current.values['var-2']).toBeUndefined();
    expect(result.current.filledCount).toBe(0);
  });

  it('ignores rows with quantity 0 when confirming', () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() => useAddItems(buildProps({ onConfirm })));

    act(() => result.current.handleQuantityChange('var-1', '5'));
    act(() => result.current.handleAdd());

    expect(onConfirm).toHaveBeenCalledTimes(1);
    const [items] = onConfirm.mock.calls[0] as [FormItem[]];
    expect(items).toHaveLength(1);
    expect(items[0].variantId).toBe('var-1');
    expect(items[0].quantity).toBe(5);
  });

  it('does not auto-clamp quantity above stock on withdrawal (RN055 mirrors, does not correct)', () => {
    const { result } = renderHook(() =>
      useAddItems(buildProps({ isWithdrawal: true }))
    );

    act(() => result.current.handleQuantityChange('var-2', '20'));

    expect(result.current.quantities['var-2']).toBe(20);
    expect(result.current.invalidKeys.has('var-2')).toBe(true);
    expect(result.current.getAvailableStock('var-2', 8)).toBe(8);
  });

  it('blocks confirm when a row is invalid', () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() =>
      useAddItems(buildProps({ isWithdrawal: true, onConfirm }))
    );

    act(() => result.current.handleQuantityChange('var-2', '20'));
    act(() => result.current.handleAdd());

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('accounts for quantity already in the batch when computing available stock', () => {
    const existingItems: FormItem[] = [
      movementBatchItemFactory.build({
        productId: 'prod-1',
        variantId: 'var-2',
        currentStock: 8,
        quantity: 6,
        unitCost: 29
      })
    ];

    const { result } = renderHook(() =>
      useAddItems(buildProps({ isWithdrawal: true, existingItems }))
    );

    expect(result.current.getAvailableStock('var-2', 8)).toBe(2);

    act(() => result.current.handleQuantityChange('var-2', '3'));
    expect(result.current.invalidKeys.has('var-2')).toBe(true);

    act(() => result.current.handleQuantityChange('var-2', '2'));
    expect(result.current.invalidKeys.has('var-2')).toBe(false);
  });

  it('prefills quantity and value from the editing item', () => {
    const editingItem: FormItem = movementBatchItemFactory.build({
      productId: 'prod-1',
      variantId: 'var-1',
      currentStock: 12,
      quantity: 4,
      unitCost: 29,
      unitPrice: 89.9
    });

    const { result } = renderHook(() =>
      useAddItems(buildProps({ isWithdrawal: true, editingItem }))
    );

    expect(result.current.quantities['var-1']).toBe(4);
    expect(result.current.values['var-1']).toBe(89.9);
  });

  it('handles products without variants using the product id as key', () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() =>
      useAddItems(buildProps({ product: withoutVariants, onConfirm }))
    );

    act(() => result.current.handleQuantityChange('prod-2', '3'));
    act(() => result.current.handleAdd());

    expect(onConfirm).toHaveBeenCalledTimes(1);
    const [items] = onConfirm.mock.calls[0] as [FormItem[]];
    expect(items).toHaveLength(1);
    expect(items[0].variantId).toBeNull();
    expect(items[0].quantity).toBe(3);
  });
});
