import { beforeEach, describe, expect, it } from 'vitest';

import type { CartItem } from '../../domain/entities';

import {
  selectCartCount,
  selectCartDiscountTotal,
  selectCartSubtotal,
  selectCartTotal,
  useCartStore
} from './cart-store';

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 'p1',
    variantId: undefined,
    name: 'Cadeira',
    unitPrice: 1000,
    discount: 0,
    quantity: 1,
    ...overrides
  };
}

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('should start with an empty cart', () => {
    expect(useCartStore.getState().items).toEqual([]);
    expect(selectCartCount(useCartStore.getState())).toBe(0);
  });

  it('should add a new item', () => {
    useCartStore.getState().addItem(makeItem());

    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it('should merge quantities when adding the same product/variant twice', () => {
    useCartStore.getState().addItem(makeItem({ quantity: 1 }));
    useCartStore.getState().addItem(makeItem({ quantity: 2 }));

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  it('should adopt the discount/unitPrice from the latest addItem call when merging', () => {
    useCartStore
      .getState()
      .addItem(makeItem({ quantity: 1, unitPrice: 1000, discount: 0 }));
    useCartStore
      .getState()
      .addItem(makeItem({ quantity: 2, unitPrice: 1000, discount: 150 }));

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
    expect(items[0].discount).toBe(150);
  });

  it('should treat different variants of the same product as separate lines', () => {
    useCartStore.getState().addItem(makeItem({ variantId: 'v1' }));
    useCartStore.getState().addItem(makeItem({ variantId: 'v2' }));

    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it('should update the quantity of an existing line', () => {
    useCartStore.getState().addItem(makeItem({ quantity: 1 }));

    useCartStore.getState().updateQty('p1', undefined, 5);

    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('should remove the line when updateQty sets quantity to zero or less', () => {
    useCartStore.getState().addItem(makeItem());

    useCartStore.getState().updateQty('p1', undefined, 0);

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('should remove an item by product/variant', () => {
    useCartStore.getState().addItem(makeItem({ variantId: 'v1' }));
    useCartStore.getState().addItem(makeItem({ variantId: 'v2' }));

    useCartStore.getState().removeItem('p1', 'v1');

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].variantId).toBe('v2');
  });

  it('should clear the cart', () => {
    useCartStore.getState().addItem(makeItem());

    useCartStore.getState().clear();

    expect(useCartStore.getState().items).toEqual([]);
  });

  describe('selectors', () => {
    beforeEach(() => {
      useCartStore.setState({
        items: [
          makeItem({
            productId: 'p1',
            unitPrice: 1000,
            discount: 100,
            quantity: 2
          }),
          makeItem({
            productId: 'p2',
            unitPrice: 500,
            discount: 0,
            quantity: 3
          })
        ]
      });
    });

    it('should compute count as the total quantity', () => {
      expect(selectCartCount(useCartStore.getState())).toBe(5);
    });

    it('should compute subtotal as the sum of unitPrice * quantity', () => {
      expect(selectCartSubtotal(useCartStore.getState())).toBe(3500);
    });

    it('should compute discountTotal as the sum of discount * quantity', () => {
      expect(selectCartDiscountTotal(useCartStore.getState())).toBe(200);
    });

    it('should compute total as subtotal minus discountTotal', () => {
      expect(selectCartTotal(useCartStore.getState())).toBe(3300);
    });

    it('should report count 0 for an empty cart', () => {
      useCartStore.setState({ items: [] });

      expect(selectCartCount(useCartStore.getState())).toBe(0);
    });
  });
});
