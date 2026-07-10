import { create } from 'zustand';

import type { CartItem } from '../../domain/entities';

function sameLine(item: CartItem, productId: string, variantId?: string) {
  return item.productId === productId && item.variantId === variantId;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQty: (
    productId: string,
    variantId: string | undefined,
    quantity: number
  ) => void;
  removeItem: (productId: string, variantId?: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) =>
        sameLine(i, item.productId, item.variantId)
      );

      if (existing) {
        return {
          items: state.items.map((i) =>
            sameLine(i, item.productId, item.variantId)
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
        };
      }

      return { items: [...state.items, item] };
    }),

  updateQty: (productId, variantId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter((i) => !sameLine(i, productId, variantId))
        };
      }

      return {
        items: state.items.map((i) =>
          sameLine(i, productId, variantId) ? { ...i, quantity } : i
        )
      };
    }),

  removeItem: (productId, variantId) =>
    set((state) => ({
      items: state.items.filter((i) => !sameLine(i, productId, variantId))
    })),

  clear: () => set({ items: [] })
}));

export function selectCartCount(state: CartState) {
  return state.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function selectCartSubtotal(state: CartState) {
  return state.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
}

export function selectCartDiscountTotal(state: CartState) {
  return state.items.reduce(
    (sum, item) => sum + item.discount * item.quantity,
    0
  );
}

export function selectCartTotal(state: CartState) {
  return selectCartSubtotal(state) - selectCartDiscountTotal(state);
}
