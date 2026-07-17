import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotificationsService } from '../../domain/services';
import { notificationFactory } from '../../tests/factories/notification.factory';

const mockUseUser = vi.fn();

vi.mock('../../domain/services', () => ({
  NotificationsService: {
    getLowStockNotification: vi.fn()
  }
}));

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

import { useLowStockQuery } from './use-queries';

describe('useLowStockQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should not run the query when there is no current organization', () => {
    mockUseUser.mockReturnValue({ currentOrganization: null });

    renderHook(() => useLowStockQuery(), { wrapper });

    expect(NotificationsService.getLowStockNotification).not.toHaveBeenCalled();
  });

  it('should fetch the low-stock notification for the current organization', async () => {
    mockUseUser.mockReturnValue({ currentOrganization: { id: 'org-1' } });
    const notification = notificationFactory.build({ type: 'low-stock' });
    vi.mocked(NotificationsService.getLowStockNotification).mockResolvedValue(
      notification
    );

    const { result } = renderHook(() => useLowStockQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(NotificationsService.getLowStockNotification).toHaveBeenCalledWith(
      'org-1'
    );
    expect(result.current.data).toEqual(notification);
  });
});
