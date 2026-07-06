import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IProduct } from '@/features/products';

import { movementBatchItemFactory } from '../schema/batch-item.factory';

import { MovementFormProvider, useMovementForm } from './use-movement-form';

const { mockUseProductsQuery, mockUseMovementCreateMutation, mockMutateAsync } =
  vi.hoisted(() => ({
    mockUseProductsQuery: vi.fn(),
    mockUseMovementCreateMutation: vi.fn(),
    mockMutateAsync: vi.fn()
  }));

vi.mock('@/features/products', () => ({
  useProductsQuery: mockUseProductsQuery
}));

vi.mock('../../../hooks/use-mutations', () => ({
  useMovementCreateMutation: mockUseMovementCreateMutation
}));

const product1 = {
  id: 'prod-1',
  name: 'Camisa Social',
  sku: 'CS-1',
  costPrice: 29,
  stock: 20,
  hasVariants: false,
  variants: []
} as unknown as IProduct;

const product2 = {
  id: 'prod-2',
  name: 'Lenço de Seda',
  sku: 'LS-1',
  costPrice: 39.9,
  stock: 6,
  hasVariants: false,
  variants: []
} as unknown as IProduct;

function wrapper({ children }: { children: ReactNode }) {
  return <MovementFormProvider>{children}</MovementFormProvider>;
}

describe('useMovementForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProductsQuery.mockReturnValue({
      data: [product1, product2],
      isLoading: false
    });
    mockMutateAsync.mockResolvedValue('new-movement-id');
    mockUseMovementCreateMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });
  });

  it('should throw when used outside MovementFormProvider', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => renderHook(() => useMovementForm())).toThrow(
      'useMovementForm deve ser usado dentro de um MovementFormProvider'
    );

    consoleError.mockRestore();
  });

  it('should start with entry reason options and no dialog open', () => {
    const { result } = renderHook(() => useMovementForm(), { wrapper });

    expect(result.current.form.getValues('type')).toBe('entry');
    expect(result.current.reasonOptions).toEqual([
      'Compra',
      'Devolução de cliente',
      'Ajuste de inventário (+)',
      'Outro'
    ]);
    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.products).toEqual([product1, product2]);
  });

  it('should switch reason options and clear the selected reason when type changes', () => {
    const { result } = renderHook(() => useMovementForm(), { wrapper });

    act(() => {
      result.current.form.setValue('reason', 'Compra');
      result.current.actions.onChangeType('withdrawal');
    });

    expect(result.current.form.getValues('type')).toBe('withdrawal');
    expect(result.current.form.getValues('reason')).toBe('');
    expect(result.current.reasonOptions).toEqual([
      'Perda/Avaria',
      'Devolução a fornecedor',
      'Uso interno',
      'Ajuste de inventário (−)',
      'Outro'
    ]);
  });

  it('should open the dialog and set the selected product on selectProduct', () => {
    const { result } = renderHook(() => useMovementForm(), { wrapper });

    act(() => {
      result.current.actions.selectProduct(product1);
    });

    expect(result.current.selectedProduct).toEqual(product1);
    expect(result.current.isDialogOpen).toBe(true);
    expect(result.current.editingIndex).toBeNull();
  });

  it('should reset the selection when the dialog is closed', () => {
    const { result } = renderHook(() => useMovementForm(), { wrapper });

    act(() => {
      result.current.actions.selectProduct(product1);
    });

    act(() => {
      result.current.actions.toggleDialog(false);
    });

    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.selectedProduct).toBeNull();
    expect(result.current.editingIndex).toBeNull();
  });

  it('should add a new item and update totalQuantity', () => {
    const { result } = renderHook(() => useMovementForm(), { wrapper });

    act(() => {
      result.current.actions.addItem([
        movementBatchItemFactory.build({ productId: 'prod-1', quantity: 3 })
      ]);
    });

    expect(result.current.form.getValues('items')).toHaveLength(1);
    expect(result.current.form.getValues('totalQuantity')).toBe(3);
    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.selectedProduct).toBeNull();
  });

  it('should merge quantities when adding the same product/variant twice', () => {
    const { result } = renderHook(() => useMovementForm(), { wrapper });

    const item = movementBatchItemFactory.build({
      productId: 'prod-1',
      quantity: 3
    });

    act(() => {
      result.current.actions.addItem([item]);
    });

    act(() => {
      result.current.actions.addItem([{ ...item, quantity: 2 }]);
    });

    const items = result.current.form.getValues('items');
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(5);
    expect(result.current.form.getValues('totalQuantity')).toBe(5);
  });

  it('should edit an existing item in place via editItem + addItem', () => {
    const { result } = renderHook(() => useMovementForm(), { wrapper });

    act(() => {
      result.current.actions.addItem([
        movementBatchItemFactory.build({ productId: 'prod-1', quantity: 3 })
      ]);
    });

    act(() => {
      result.current.actions.editItem(0);
    });

    expect(result.current.editingIndex).toBe(0);
    expect(result.current.selectedProduct).toEqual(product1);
    expect(result.current.isDialogOpen).toBe(true);
    expect(result.current.editingItem?.quantity).toBe(3);

    act(() => {
      result.current.actions.addItem([
        movementBatchItemFactory.build({ productId: 'prod-1', quantity: 9 })
      ]);
    });

    const items = result.current.form.getValues('items');
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(9);
  });

  it('should do nothing when editItem is called with an unknown index or product', () => {
    const { result } = renderHook(() => useMovementForm(), { wrapper });

    act(() => {
      result.current.actions.editItem(0);
    });

    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.editingIndex).toBeNull();
  });

  it('should remove an item and recalculate totalQuantity', () => {
    const { result } = renderHook(() => useMovementForm(), { wrapper });

    act(() => {
      result.current.actions.addItem([
        movementBatchItemFactory.build({ productId: 'prod-1', quantity: 3 })
      ]);
    });

    act(() => {
      result.current.actions.removeItem(0);
    });

    expect(result.current.form.getValues('items')).toHaveLength(0);
    expect(result.current.form.getValues('totalQuantity')).toBe(0);
  });

  it('should recalculate totalQuantity from the remaining items after removal', () => {
    const { result } = renderHook(() => useMovementForm(), { wrapper });

    act(() => {
      result.current.actions.addItem([
        movementBatchItemFactory.build({ productId: 'prod-1', quantity: 3 })
      ]);
    });

    act(() => {
      result.current.actions.addItem([
        movementBatchItemFactory.build({ productId: 'prod-2', quantity: 2 })
      ]);
    });

    act(() => {
      result.current.actions.removeItem(0);
    });

    const items = result.current.form.getValues('items');
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe('prod-2');
    expect(result.current.form.getValues('totalQuantity')).toBe(2);
  });

  it('should preselect the product and open the dialog when preselectProductId matches a loaded product', async () => {
    const { result } = renderHook(() => useMovementForm(), {
      wrapper: ({ children }) => (
        <MovementFormProvider preselectProductId="prod-2">
          {children}
        </MovementFormProvider>
      )
    });

    await waitFor(() => {
      expect(result.current.selectedProduct).toEqual(product2);
    });
    expect(result.current.isDialogOpen).toBe(true);
  });

  it('should submit the form, reset it and call onSuccess', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useMovementForm(), {
      wrapper: ({ children }) => (
        <MovementFormProvider onSuccess={onSuccess}>
          {children}
        </MovementFormProvider>
      )
    });

    const batchItem = movementBatchItemFactory.build({
      productId: 'prod-1',
      quantity: 3
    });

    await act(async () => {
      await result.current.actions.submit({
        type: 'entry',
        date: new Date('2024-01-10'),
        time: '14:30',
        reason: 'Compra',
        description: '',
        documentNumber: '',
        totalQuantity: 3,
        items: [batchItem]
      } as never);
    });

    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'entry',
        reason: 'Compra',
        description: undefined,
        items: [
          {
            productId: batchItem.productId,
            variantId: batchItem.variantId,
            quantity: batchItem.quantity,
            unitCost: batchItem.unitCost,
            unitPrice: batchItem.unitPrice
          }
        ]
      })
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('should keep the description when reason is "Outro"', async () => {
    const { result } = renderHook(() => useMovementForm(), { wrapper });

    await act(async () => {
      await result.current.actions.submit({
        type: 'entry',
        date: new Date('2024-01-10'),
        time: '09:00',
        reason: 'Outro',
        description: 'Motivo customizado',
        documentNumber: '',
        totalQuantity: 0,
        items: []
      } as never);
    });

    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Motivo customizado' })
    );
  });

  it('should reset the form and call onCancel when cancel is called', () => {
    const onCancel = vi.fn();
    const { result } = renderHook(() => useMovementForm(), {
      wrapper: ({ children }) => (
        <MovementFormProvider onCancel={onCancel}>
          {children}
        </MovementFormProvider>
      )
    });

    act(() => {
      result.current.form.setValue('reason', 'Compra');
    });

    act(() => {
      result.current.actions.cancel();
    });

    expect(result.current.form.getValues('reason')).toBe('');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should expose isSubmitting from the create mutation', () => {
    mockUseMovementCreateMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true
    });

    const { result } = renderHook(() => useMovementForm(), { wrapper });

    expect(result.current.isSubmitting).toBe(true);
  });
});
