import { startOfDay, subDays } from 'date-fns';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveDateRangePreset } from './index';

describe('resolveDateRangePreset', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve "Hoje" (daysAgo 0) to the start and end of today', () => {
    const range = resolveDateRangePreset(0);

    expect(range.from.toDateString()).toBe(new Date().toDateString());
    expect(range.to.toDateString()).toBe(new Date().toDateString());
    expect(range.from.getHours()).toBe(0);
  });

  it('should resolve "Últimos 7 dias" (daysAgo 6) starting 6 days ago', () => {
    const range = resolveDateRangePreset(6);

    expect(range.from).toEqual(startOfDay(subDays(new Date(), 6)));
    expect(range.to.toDateString()).toBe(new Date().toDateString());
  });
});
