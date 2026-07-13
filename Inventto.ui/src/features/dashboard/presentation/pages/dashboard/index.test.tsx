import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DashboardAPI } from '../../../data/api';
import { onboardingStatusFactory } from '../../../tests/factories/onboarding-status.factory';
import { salesSummaryFactory } from '../../../tests/factories/sales-summary.factory';

const { mockUseUser } = vi.hoisted(() => ({ mockUseUser: vi.fn() }));

vi.mock('@/features/users', () => ({
  useUser: mockUseUser
}));

vi.mock('../../../data/api');

vi.mock('../../components/attention-block', () => ({
  AttentionBlock: ({ role }: { role: string }) => (
    <div>Attention block for {role}</div>
  )
}));

import { DashboardPage } from '.';

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

describe('DashboardPage', () => {
  it('should render the greeting and the three blocks when there is operational activity', async () => {
    mockUseUser.mockReturnValue({
      user: { fullName: 'Joana Silva' },
      currentOrganization: { id: 'org-1', name: 'Ateliê Joana' },
      role: 'owner'
    });
    vi.mocked(DashboardAPI.getOnboardingStatus).mockResolvedValue(
      onboardingStatusFactory.build({ hasSales: true })
    );
    vi.mocked(DashboardAPI.getSalesSummary).mockResolvedValue(
      salesSummaryFactory.build()
    );
    vi.mocked(DashboardAPI.getRecentActivity).mockResolvedValue({});

    renderWithProviders(<DashboardPage />);

    await waitFor(() =>
      expect(screen.getByText('Bom dia, Joana')).toBeInTheDocument()
    );
    expect(screen.getByText('Attention block for owner')).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText('Resumo de vendas')).toBeInTheDocument()
    );
  });

  it('should render the onboarding instead of the blocks on first use (no products, catalog, storefront or sales)', async () => {
    mockUseUser.mockReturnValue({
      user: { fullName: 'Joana Silva' },
      currentOrganization: { id: 'org-1', name: 'Ateliê Joana' },
      role: 'owner'
    });
    vi.mocked(DashboardAPI.getOnboardingStatus).mockResolvedValue(
      onboardingStatusFactory.build()
    );

    renderWithProviders(<DashboardPage />);

    await waitFor(() =>
      expect(screen.getByText('Vamos preparar sua loja.')).toBeInTheDocument()
    );
    expect(screen.queryByText('Bom dia, Joana')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Attention block for owner')
    ).not.toBeInTheDocument();
  });

  it('should render nothing while the user/organization is not resolved yet', () => {
    mockUseUser.mockReturnValue({
      user: null,
      currentOrganization: null,
      role: undefined
    });

    const { container } = renderWithProviders(<DashboardPage />);

    expect(container).toBeEmptyDOMElement();
  });
});
