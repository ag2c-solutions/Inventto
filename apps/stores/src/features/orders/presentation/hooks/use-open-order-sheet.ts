import { useOrderSheetStore } from '../stores/order-sheet-store';

export function useOpenOrderSheet() {
  return useOrderSheetStore((state) => state.open);
}
