import { create } from 'zustand';

interface OrderSheetState {
  orderId: string | null;
  open: (orderId: string) => void;
  close: () => void;
}

export const useOrderSheetStore = create<OrderSheetState>((set) => ({
  orderId: null,
  open: (orderId) => set({ orderId }),
  close: () => set({ orderId: null })
}));
