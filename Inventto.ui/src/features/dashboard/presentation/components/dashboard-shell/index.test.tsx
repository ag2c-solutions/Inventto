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

    // SalesBlock agora é dono do próprio título (varia por papel — RF037
    // não tem heading fixo no shell), então só Atenção/Atividade aparecem
    // como heading nível 2 aqui; a ordem geral é verificada pela posição
    // no texto renderizado.
    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);

    expect(headings).toEqual(['Atenção imediata', 'Atividade e atalhos']);

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
});
