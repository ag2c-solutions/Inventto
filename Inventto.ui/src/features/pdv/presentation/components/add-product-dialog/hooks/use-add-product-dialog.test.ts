import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { pdvProductFactory } from '../../../../tests/factories/pdv-product.factory';
import { useCartStore } from '../../../stores/cart-store';

import { useAddProductDialog } from './use-add-product-dialog';

describe('useAddProductDialog', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('should start with qty 1 and no discount', () => {
    const product = pdvProductFactory.build({ price: 10000, stock: 10 });

    const { result } = renderHook(() => useAddProductDialog(product));

    expect(result.current.qty).toBe(1);
    expect(result.current.discountOn).toBe(false);
    expect(result.current.pricing.unitFinalPrice).toBe(10000);
  });

  it('should reset the form when the product changes', () => {
    const productA = pdvProductFactory.build({ productId: 'p1', stock: 10 });
    const productB = pdvProductFactory.build({ productId: 'p2', stock: 10 });

    const { result, rerender } = renderHook(
      ({ product }) => useAddProductDialog(product),
      { initialProps: { product: productA } }
    );

    act(() => {
      result.current.increment();
      result.current.setDiscountOn(true);
    });
    expect(result.current.qty).toBe(2);
    expect(result.current.discountOn).toBe(true);

    rerender({ product: productB });

    expect(result.current.qty).toBe(1);
    expect(result.current.discountOn).toBe(false);
  });

  it('should not increment past the available stock', () => {
    const product = pdvProductFactory.build({ stock: 2 });

    const { result } = renderHook(() => useAddProductDialog(product));

    act(() => result.current.increment());
    expect(result.current.qty).toBe(2);
    expect(result.current.atMax).toBe(true);

    act(() => result.current.increment());
    expect(result.current.qty).toBe(2);
  });

  it('should not decrement below 1', () => {
    const product = pdvProductFactory.build({ stock: 10 });

    const { result } = renderHook(() => useAddProductDialog(product));

    act(() => result.current.decrement());

    expect(result.current.qty).toBe(1);
    expect(result.current.atMin).toBe(true);
  });

  it('should subtract the quantity already in the cart from the available balance', () => {
    const product = pdvProductFactory.build({
      productId: 'p1',
      variantId: undefined,
      stock: 5
    });
    useCartStore.getState().addItem({
      productId: 'p1',
      name: product.name,
      unitPrice: product.price,
      discount: 0,
      quantity: 3
    });

    const { result } = renderHook(() => useAddProductDialog(product));

    expect(result.current.available).toBe(2);
  });

  it('should recompute pricing when the discount is toggled on', () => {
    const product = pdvProductFactory.build({ price: 10000, stock: 10 });

    const { result } = renderHook(() => useAddProductDialog(product));

    act(() => {
      result.current.setDiscountOn(true);
      result.current.setDiscountValue(1000);
    });

    expect(result.current.pricing.discountAmount).toBe(1000);
    expect(result.current.pricing.unitFinalPrice).toBe(9000);
  });

  it('should mark invalid when the discount exceeds the reference price', () => {
    const product = pdvProductFactory.build({ price: 5000, stock: 10 });

    const { result } = renderHook(() => useAddProductDialog(product));

    act(() => {
      result.current.setDiscountOn(true);
      result.current.setDiscountValue(6000);
    });

    expect(result.current.invalid).toBe(true);
    expect(result.current.validationMessage).toBe(
      'O desconto não pode ser maior que o preço de referência.'
    );
  });

  it('should add the item to the cart store on confirm', () => {
    const product = pdvProductFactory.build({
      productId: 'p1',
      price: 10000,
      stock: 10
    });

    const { result } = renderHook(() => useAddProductDialog(product));

    act(() => result.current.increment());
    act(() => result.current.confirm());

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      productId: 'p1',
      unitPrice: 10000,
      discount: 0,
      quantity: 2
    });
  });

  it('should not add to the cart on confirm when the discount is invalid', () => {
    const product = pdvProductFactory.build({ price: 5000, stock: 10 });

    const { result } = renderHook(() => useAddProductDialog(product));

    act(() => result.current.setDiscountOn(true));
    act(() => result.current.setDiscountValue(6000));
    act(() => result.current.confirm());

    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
