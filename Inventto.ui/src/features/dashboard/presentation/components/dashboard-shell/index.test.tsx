import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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

  it('should show the full attention cards and the owner-only extras for the owner', () => {
    render(<DashboardShell role="owner" />);

    expect(screen.getByText('Estoque crítico ou zerado')).toBeInTheDocument();
    expect(screen.getByText('Últimos pedidos')).toBeInTheDocument();
    expect(screen.getByText(/exclusivo do Dono/)).toBeInTheDocument();
  });

  it('should show the full attention cards for the manager without owner extras', () => {
    render(<DashboardShell role="manager" />);

    expect(screen.getByText('Estoque crítico ou zerado')).toBeInTheDocument();
    expect(screen.queryByText(/exclusivo do Dono/)).not.toBeInTheDocument();
  });

  it('should hide stock alerts and store performance for the sales role', () => {
    render(<DashboardShell role="sales" />);

    expect(
      screen.queryByText('Estoque crítico ou zerado')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Últimos pedidos')).not.toBeInTheDocument();
    expect(
      screen.getByText('Pedidos do pool perto de expirar')
    ).toBeInTheDocument();
    expect(screen.getByText('Suas últimas vendas')).toBeInTheDocument();
  });
});
