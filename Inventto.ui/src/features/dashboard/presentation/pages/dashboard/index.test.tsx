import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { mockUseUser } = vi.hoisted(() => ({ mockUseUser: vi.fn() }));

vi.mock('@/features/users', () => ({
  useUser: mockUseUser
}));

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
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('DashboardPage', () => {
  it('should render the greeting and the three blocks for the current role', () => {
    mockUseUser.mockReturnValue({
      user: { fullName: 'Joana Silva' },
      currentOrganization: { id: 'org-1', name: 'Ateliê Joana' },
      role: 'owner'
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Bom dia, Joana')).toBeInTheDocument();
    expect(screen.getByText('Atenção imediata')).toBeInTheDocument();
    expect(screen.getByText('Resumo de vendas')).toBeInTheDocument();
    expect(screen.getByText('Atividade e atalhos')).toBeInTheDocument();
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
