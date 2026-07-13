import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../attention-block', () => ({
  AttentionBlock: ({ role }: { role: string }) => (
    <div>Attention block for {role}</div>
  )
}));

import { DashboardShell } from '.';

describe('DashboardShell', () => {
  it('should compose the three blocks in order: Atenção, Vendas, Atividade', () => {
    render(<DashboardShell role="owner" />);

    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);

    expect(headings).toEqual([
      'Atenção imediata',
      'Resumo de vendas',
      'Atividade e atalhos'
    ]);
  });

  it('should render the attention block for the current role', () => {
    render(<DashboardShell role="sales" />);

    expect(screen.getByText('Attention block for sales')).toBeInTheDocument();
  });

  it('should show the full activity cards and the owner-only extras for the owner', () => {
    render(<DashboardShell role="owner" />);

    expect(screen.getByText('Últimos pedidos')).toBeInTheDocument();
    expect(screen.getByText(/exclusivo do Dono/)).toBeInTheDocument();
  });

  it('should show the full activity cards for the manager without owner extras', () => {
    render(<DashboardShell role="manager" />);

    expect(screen.getByText('Últimos pedidos')).toBeInTheDocument();
    expect(screen.queryByText(/exclusivo do Dono/)).not.toBeInTheDocument();
  });

  it('should show the reduced activity cards and own-sales copy for sales', () => {
    render(<DashboardShell role="sales" />);

    expect(screen.queryByText('Últimos pedidos')).not.toBeInTheDocument();
    expect(screen.getByText('Suas últimas vendas')).toBeInTheDocument();
    expect(screen.getByText('Suas vendas hoje')).toBeInTheDocument();
  });
});
