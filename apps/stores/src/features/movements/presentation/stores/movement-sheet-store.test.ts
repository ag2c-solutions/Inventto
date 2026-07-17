import { describe, expect, it } from 'vitest';

import { useMovementSheetStore } from './movement-sheet-store';

describe('useMovementSheetStore', () => {
  it('should start closed with no preselected product', () => {
    const state = useMovementSheetStore.getState();

    expect(state.isOpen).toBe(false);
    expect(state.preselectProductId).toBeUndefined();
  });

  it('should open the sheet and set the preselected product', () => {
    useMovementSheetStore.getState().open('prod-1');

    const state = useMovementSheetStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.preselectProductId).toBe('prod-1');
  });

  it('should open the sheet without a preselected product', () => {
    useMovementSheetStore.getState().open();

    const state = useMovementSheetStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.preselectProductId).toBeUndefined();
  });

  it('should close the sheet and clear the preselected product', () => {
    useMovementSheetStore.getState().open('prod-1');
    useMovementSheetStore.getState().close();

    const state = useMovementSheetStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.preselectProductId).toBeUndefined();
  });
});
