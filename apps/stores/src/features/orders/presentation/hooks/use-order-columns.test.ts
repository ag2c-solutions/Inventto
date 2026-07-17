import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { orderFactory } from '../../tests/factories/order.factory';

import { useOrderColumns } from './use-order-columns';

describe('useOrderColumns', () => {
  it('should group orders by macro-state', () => {
    const pool = orderFactory.build({ macroState: 'pool' });
    const attending = orderFactory.build({ macroState: 'attending' });
    const done = orderFactory.build({ macroState: 'done' });
    const cancelled = orderFactory.build({ macroState: 'cancelled' });

    const { result } = renderHook(() =>
      useOrderColumns([pool, attending, done, cancelled])
    );

    expect(result.current.pool).toEqual([pool]);
    expect(result.current.attending).toEqual([attending]);
    expect(result.current.done).toEqual([done]);
    expect(result.current.cancelled).toEqual([cancelled]);
  });

  it('should sort the "attending" column by last action (most recent first)', () => {
    const older = orderFactory.build({
      macroState: 'attending',
      lastActionAt: new Date('2026-07-01T10:00:00Z')
    });
    const newer = orderFactory.build({
      macroState: 'attending',
      lastActionAt: new Date('2026-07-05T10:00:00Z')
    });

    const { result } = renderHook(() => useOrderColumns([older, newer]));

    expect(result.current.attending).toEqual([newer, older]);
  });
});
