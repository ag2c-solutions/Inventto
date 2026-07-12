import { describe, expect, it } from 'vitest';

import { useOrderSheetStore } from './order-sheet-store';

describe('useOrderSheetStore', () => {
  it('should start closed with no order', () => {
    const state = useOrderSheetStore.getState();

    expect(state.orderId).toBeNull();
  });

  it('should open the sheet for a given order id', () => {
    useOrderSheetStore.getState().open('o1');

    expect(useOrderSheetStore.getState().orderId).toBe('o1');
  });

  it('should close the sheet and clear the order id', () => {
    useOrderSheetStore.getState().open('o1');
    useOrderSheetStore.getState().close();

    expect(useOrderSheetStore.getState().orderId).toBeNull();
  });
});
