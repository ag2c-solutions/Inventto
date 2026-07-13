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

vi.mock('../activity-block', () => ({
  ActivityBlock: ({ role }: { role: string }) => (
    <div>Activity block for {role}</div>
  )
}));

import { DashboardShell } from '.';

describe('DashboardShell', () => {
  it('should compose the three blocks in order: Atenção, Vendas, Atividade', () => {
    render(<DashboardShell role="owner" />);

    // Os componentes de bloco agora renderizam seus próprios títulos.
    // A ordem geral continua sendo verificada pela posição no texto renderizado.

    const text = document.body.textContent ?? '';
    expect(text.indexOf('Attention block for owner')).toBeLessThan(
      text.indexOf('Sales block for owner')
    );
    expect(text.indexOf('Sales block for owner')).toBeLessThan(
      text.indexOf('Activity block for owner')
    );
  });

  it('should render the attention, sales and activity blocks for the current role', () => {
    render(<DashboardShell role="sales" />);

    expect(screen.getByText('Attention block for sales')).toBeInTheDocument();
    expect(screen.getByText('Sales block for sales')).toBeInTheDocument();
    expect(screen.getByText('Activity block for sales')).toBeInTheDocument();
  });

  // DASH-06: guarda de regressão — o wireframe base é coluna única em
  // qualquer largura (o grid 2 colunas do bloco de Atividade é interno,
  // não do shell). Não usa breakpoint nenhum: sempre flex-col.
  it('should always stack the three blocks in a single column (no responsive grid at the shell level)', () => {
    const { container } = render(<DashboardShell role="owner" />);

    expect(container.firstElementChild).toHaveClass('flex-col');
    expect(container.firstElementChild?.className).not.toMatch(/\bgrid\b/);
  });
});
