import { create } from 'zustand';

interface MovementSheetState {
  isOpen: boolean;
  preselectProductId?: string;
  open: (preselectProductId?: string) => void;
  close: () => void;
}

export const useMovementSheetStore = create<MovementSheetState>((set) => ({
  isOpen: false,
  preselectProductId: undefined,
  open: (preselectProductId) => set({ isOpen: true, preselectProductId }),
  close: () => set({ isOpen: false, preselectProductId: undefined })
}));
