import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useOrderSheetStore } from '../stores/order-sheet-store';

import { useOpenOrderSheet } from './use-open-order-sheet';

describe('useOpenOrderSheet', () => {
  it('should return the store open action and open the sheet when called', () => {
    const { result } = renderHook(() => useOpenOrderSheet());

    result.current('o1');

    expect(useOrderSheetStore.getState().orderId).toBe('o1');
  });
});
