import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notificationFactory } from '../../../tests/factories/notification.factory';
import { useNotifications } from '../../hooks/use-notifications';

import { NotificationBell } from '.';

vi.mock('../../hooks/use-notifications', () => ({
  useNotifications: vi.fn()
}));

const mockUseNotifications = vi.mocked(useNotifications);

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not show the unread badge when there are no notifications', () => {
    mockUseNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markAllAsRead: vi.fn(),
      hasNotifications: false
    });

    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    );

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should show the unread count badge', () => {
    mockUseNotifications.mockReturnValue({
      notifications: [notificationFactory.build()],
      unreadCount: 2,
      markAllAsRead: vi.fn(),
      hasNotifications: true
    });

    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should mark notifications as read when opened', async () => {
    const markAllAsRead = vi.fn();
    mockUseNotifications.mockReturnValue({
      notifications: [notificationFactory.build()],
      unreadCount: 1,
      markAllAsRead,
      hasNotifications: true
    });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Notificações' }));

    expect(markAllAsRead).toHaveBeenCalledOnce();
  });

  it('should show the empty state when there are no notifications', async () => {
    mockUseNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markAllAsRead: vi.fn(),
      hasNotifications: false
    });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Notificações' }));

    expect(await screen.findByText('Sem novidades.')).toBeInTheDocument();
  });
});
