import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DashboardAPI } from '../../../data/api';
import { attentionSummaryFactory } from '../../../tests/factories/attention-summary.factory';

import { AttentionBlock } from '.';

vi.mock('../../../data/api');

vi.mock('@/features/users', () => ({
  useUser: () => ({ currentOrganization: { id: 'org-1' } })
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AttentionBlock', () => {
  it('should show the three actionable cards for owner/manager', async () => {
    vi.mocked(DashboardAPI.getAttentionSummary).mockResolvedValue(
      attentionSummaryFactory.build({
        pendingOrders: 5,
        lowStock: 3,
        expiringSoon: 2
      })
    );

    renderWithProviders(<AttentionBlock role="owner" />);

    await waitFor(() =>
      expect(screen.getByText('Pedidos pendentes')).toBeInTheDocument()
    );
    expect(screen.getByText('Estoque crítico ou zerado')).toBeInTheDocument();
    expect(screen.getByText('Expirando em breve')).toBeInTheDocument();
    expect(screen.getByText('< 30 min')).toBeInTheDocument();
  });

  it('should show only the pool-expiring card for sales', async () => {
    vi.mocked(DashboardAPI.getAttentionSummary).mockResolvedValue(
      attentionSummaryFactory.build({
        pendingOrders: undefined,
        lowStock: undefined,
        expiringSoon: 2
      })
    );

    renderWithProviders(<AttentionBlock role="sales" />);

    await waitFor(() =>
      expect(
        screen.getByText('Pedidos do pool perto de expirar')
      ).toBeInTheDocument()
    );
    expect(screen.queryByText('Pedidos pendentes')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Estoque crítico ou zerado')
    ).not.toBeInTheDocument();
    expect(screen.getByText('Urgente')).toBeInTheDocument();
  });

  it('should show the error state and allow retry when the query fails', async () => {
    vi.mocked(DashboardAPI.getAttentionSummary).mockRejectedValue(
      new Error('boom')
    );

    renderWithProviders(<AttentionBlock role="owner" />);

    await waitFor(() =>
      expect(screen.getByText('Não foi possível carregar.')).toBeInTheDocument()
    );
  });
});
