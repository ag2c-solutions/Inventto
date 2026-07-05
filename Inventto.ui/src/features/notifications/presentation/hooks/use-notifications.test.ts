import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUser } from '@/features/users';

import { NotificationsService } from '../../domain/services';
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
const mockSubscribeToOrders = vi.mocked(NotificationsService.subscribeToOrders);

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

  it('should prepend a new order notification when the subscription callback fires', () => {
    mockUseLowStockQuery.mockReturnValue({ data: null } as never);

    const { result } = renderHook(() => useNotifications());

    const newOrderNotification = notificationFactory.build({
      type: 'new-order'
    });
    const onNotification = mockSubscribeToOrders.mock.calls[0][1];

    act(() => {
      onNotification(newOrderNotification);
    });

    expect(result.current.notifications).toEqual([newOrderNotification]);
    expect(result.current.hasNotifications).toBe(true);
  });

  it('should subscribe with the current organization id', () => {
    mockUseLowStockQuery.mockReturnValue({ data: null } as never);

    renderHook(() => useNotifications());

    expect(mockSubscribeToOrders).toHaveBeenCalledWith(
      'org-1',
      expect.any(Function)
    );
  });

  it('should clear order notifications when there is no current organization', () => {
    mockUseUser.mockReturnValue({ currentOrganization: null } as never);
    mockUseLowStockQuery.mockReturnValue({ data: null } as never);

    const { result } = renderHook(() => useNotifications());

    expect(mockSubscribeToOrders).toHaveBeenCalledWith(
      undefined,
      expect.any(Function)
    );
    expect(result.current.notifications).toHaveLength(0);
  });

  it('should unsubscribe from the orders channel on unmount', () => {
    const unsubscribe = vi.fn();
    mockSubscribeToOrders.mockReturnValue({ unsubscribe } as never);
    mockUseLowStockQuery.mockReturnValue({ data: null } as never);

    const { unmount } = renderHook(() => useNotifications());

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
