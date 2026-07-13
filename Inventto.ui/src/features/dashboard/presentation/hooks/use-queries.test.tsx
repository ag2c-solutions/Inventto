import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DashboardAPI } from '../../data/api';
import { attentionSummaryFactory } from '../../tests/factories/attention-summary.factory';
import { salesSummaryFactory } from '../../tests/factories/sales-summary.factory';

const mockUseUser = vi.fn();

vi.mock('../../data/api');

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

import { useAttentionSummaryQuery, useSalesSummaryQuery } from './use-queries';

describe('useAttentionSummaryQuery', () => {
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

    renderHook(() => useAttentionSummaryQuery(), { wrapper });

    expect(DashboardAPI.getAttentionSummary).not.toHaveBeenCalled();
  });

  it('should fetch the attention summary for the current organization', async () => {
    mockUseUser.mockReturnValue({ currentOrganization: { id: 'org-1' } });
    const summary = attentionSummaryFactory.build();
    vi.mocked(DashboardAPI.getAttentionSummary).mockResolvedValue(summary);

    const { result } = renderHook(() => useAttentionSummaryQuery(), {
      wrapper
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(DashboardAPI.getAttentionSummary).toHaveBeenCalledWith('org-1');
    expect(result.current.data).toEqual(summary);
  });
});

describe('useSalesSummaryQuery', () => {
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

    renderHook(() => useSalesSummaryQuery('30d'), { wrapper });

    expect(DashboardAPI.getSalesSummary).not.toHaveBeenCalled();
  });

  it('should fetch the sales summary for the current organization and period', async () => {
    mockUseUser.mockReturnValue({ currentOrganization: { id: 'org-1' } });
    const summary = salesSummaryFactory.build();
    vi.mocked(DashboardAPI.getSalesSummary).mockResolvedValue(summary);

    const { result } = renderHook(() => useSalesSummaryQuery('7d'), {
      wrapper
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(DashboardAPI.getSalesSummary).toHaveBeenCalledWith('org-1', '7d');
    expect(result.current.data).toEqual(summary);
  });

  it('should refetch when the period changes (cache key includes period)', async () => {
    mockUseUser.mockReturnValue({ currentOrganization: { id: 'org-1' } });
    vi.mocked(DashboardAPI.getSalesSummary).mockResolvedValue(
      salesSummaryFactory.build()
    );

    const { result, rerender } = renderHook(
      ({ period }: { period: '30d' | '90d' }) => useSalesSummaryQuery(period),
      { wrapper, initialProps: { period: '30d' } }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ period: '90d' });

    await waitFor(() =>
      expect(DashboardAPI.getSalesSummary).toHaveBeenCalledWith('org-1', '90d')
    );
  });
});
