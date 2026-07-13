import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DashboardPage } from '.';

const { mockUseUser } = vi.hoisted(() => ({ mockUseUser: vi.fn() }));

vi.mock('@/features/users', () => ({
  useUser: mockUseUser
}));

describe('DashboardPage', () => {
  it('should render the greeting and the three blocks for the current role', () => {
    mockUseUser.mockReturnValue({
      user: { fullName: 'Joana Silva' },
      currentOrganization: { id: 'org-1', name: 'Ateliê Joana' },
      role: 'owner'
    });

    render(<DashboardPage />);

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

    const { container } = render(<DashboardPage />);

    expect(container).toBeEmptyDOMElement();
  });
});
