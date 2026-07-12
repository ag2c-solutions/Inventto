import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OrderTimer } from './index';
import { getCountdown } from './utils';

describe('getCountdown', () => {
  it('should format minutes and seconds with zero padding', () => {
    const now = new Date('2026-07-10T10:00:00Z');
    const expiresAt = new Date('2026-07-10T10:12:45Z');

    const result = getCountdown(expiresAt, now);

    expect(result.label).toBe('12:45');
    expect(result.remainingSeconds).toBe(765);
  });

  it('should become urgent under 3 minutes', () => {
    const now = new Date('2026-07-10T10:00:00Z');
    const expiresAt = new Date('2026-07-10T10:02:48Z');

    const result = getCountdown(expiresAt, now);

    expect(result.urgent).toBe(true);
  });

  it('should not be urgent at 3 minutes or more', () => {
    const now = new Date('2026-07-10T10:00:00Z');
    const expiresAt = new Date('2026-07-10T10:03:00Z');

    const result = getCountdown(expiresAt, now);

    expect(result.urgent).toBe(false);
  });

  it('should clamp to 00:00 when already expired', () => {
    const now = new Date('2026-07-10T10:05:00Z');
    const expiresAt = new Date('2026-07-10T10:00:00Z');

    const result = getCountdown(expiresAt, now);

    expect(result.label).toBe('00:00');
    expect(result.remainingSeconds).toBe(0);
    expect(result.urgent).toBe(true);
  });
});

describe('OrderTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-10T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the countdown label', () => {
    render(<OrderTimer expiresAt={new Date('2026-07-10T10:12:45Z')} />);

    expect(screen.getByText('12:45')).toBeInTheDocument();
  });

  it('should tick down every second', () => {
    render(<OrderTimer expiresAt={new Date('2026-07-10T10:00:10Z')} />);

    expect(screen.getByText('00:10')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText('00:07')).toBeInTheDocument();
  });
});
