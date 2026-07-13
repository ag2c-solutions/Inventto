import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../attention-block', () => ({
  AttentionBlock: ({ role }: { role: string }) => (
    <div>Attention block for {role}</div>
  )
}));

vi.mock('../sales-block', () => ({
  SalesBlock: ({ role }: { role: string }) => <div>Sales block for {role}</div>
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

  it('should render the attention block and sales block for the current role', () => {
    render(<DashboardShell role="sales" />);

    expect(screen.getByText('Attention block for sales')).toBeInTheDocument();
    expect(screen.getByText('Sales block for sales')).toBeInTheDocument();
  });

  it('should show the full activity cards for the owner', () => {
    render(<DashboardShell role="owner" />);

    expect(screen.getByText('Últimos pedidos')).toBeInTheDocument();
  });

  it('should show the full activity cards for the manager', () => {
    render(<DashboardShell role="manager" />);

    expect(screen.getByText('Últimos pedidos')).toBeInTheDocument();
  });

  it('should show the reduced activity cards for sales', () => {
    render(<DashboardShell role="sales" />);

    expect(screen.queryByText('Últimos pedidos')).not.toBeInTheDocument();
    expect(screen.getByText('Suas últimas vendas')).toBeInTheDocument();
  });
});
