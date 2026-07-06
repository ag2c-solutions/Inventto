import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useMovementSheetStore } from '../stores/movement-sheet-store';

import { useOpenMovementSheet } from './use-open-movement-sheet';

describe('useOpenMovementSheet', () => {
  it('should return the store open action and open the sheet when called', () => {
    const { result } = renderHook(() => useOpenMovementSheet());

    result.current('prod-1');

    const state = useMovementSheetStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.preselectProductId).toBe('prod-1');
  });
});
