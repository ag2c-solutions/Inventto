import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUser } from '@/features/users';

import { notificationFactory } from '../../tests/factories/notification.factory';

import { useNotifications } from './use-notifications';
import { useLowStockQuery } from './use-queries';

vi.mock('@/features/users', () => ({
  useUser: vi.fn()
}));

vi.mock('../../domain/services', () => ({
  NotificationsService: {
    subscribeToOrders: vi.fn(() => null)
  }
}));

vi.mock('./use-queries', () => ({
  useLowStockQuery: vi.fn()
}));

const mockUseUser = vi.mocked(useUser);
const mockUseLowStockQuery = vi.mocked(useLowStockQuery);

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseUser.mockReturnValue({
      currentOrganization: { id: 'org-1', name: 'Inventto', role: 'owner' }
    } as never);
  });

  it('should not show a low-stock notification when there is none', () => {
    mockUseLowStockQuery.mockReturnValue({ data: null } as never);

    const { result } = renderHook(() => useNotifications());

    expect(result.current.hasNotifications).toBe(false);
    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should show the real low-stock notification when there is one', () => {
    const lowStock = notificationFactory.build({
      id: 'low-stock-alert',
      type: 'low-stock'
    });
    mockUseLowStockQuery.mockReturnValue({ data: lowStock } as never);

    const { result } = renderHook(() => useNotifications());

    expect(result.current.hasNotifications).toBe(true);
    expect(result.current.notifications).toEqual([lowStock]);
    expect(result.current.unreadCount).toBe(1);
  });

  it('should mark the low-stock notification as read when markAllAsRead is called', () => {
    const lowStock = notificationFactory.build({
      id: 'low-stock-alert',
      type: 'low-stock',
      isRead: false
    });
    mockUseLowStockQuery.mockReturnValue({ data: lowStock } as never);

    const { result } = renderHook(() => useNotifications());

    expect(result.current.unreadCount).toBe(1);

    act(() => {
      result.current.markAllAsRead();
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications[0].isRead).toBe(true);
  });
});
