import { useMovementSheetStore } from '../stores/movement-sheet-store';

export function useOpenMovementSheet() {
  return useMovementSheetStore((state) => state.open);
}
