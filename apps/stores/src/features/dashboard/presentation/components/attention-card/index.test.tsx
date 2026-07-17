import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { Package } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { AttentionCard } from '.';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('AttentionCard', () => {
  it('should render the number, label and link to the action route', () => {
    renderWithRouter(
      <AttentionCard
        icon={Package}
        value={5}
        label="Pedidos pendentes"
        href="/pedidos"
        accent="warning"
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Pedidos pendentes')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/pedidos');
  });

  it('should show the badge when provided and the value is not zero', () => {
    renderWithRouter(
      <AttentionCard
        icon={Package}
        value={2}
        label="Expirando em breve"
        href="/pedidos"
        accent="warning"
        badge="< 30 min"
      />
    );

    expect(screen.getByText('< 30 min')).toBeInTheDocument();
  });

  it('should render the zero state muted, without the badge', () => {
    renderWithRouter(
      <AttentionCard
        icon={Package}
        value={0}
        label="Expirando em breve"
        href="/pedidos"
        accent="warning"
        badge="< 30 min"
      />
    );

    expect(screen.getByText('0')).toHaveClass('text-muted-foreground');
    expect(screen.queryByText('< 30 min')).not.toBeInTheDocument();
  });
});
