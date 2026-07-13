import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { recentMovementFactory } from '../../../tests/factories/recent-activity.factory';

import { MovesCard } from '.';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('MovesCard', () => {
  it('should show an entry movement with the + sign and reason', () => {
    const movement = recentMovementFactory.build({
      type: 'entry',
      reason: 'Compra',
      totalQuantity: 12,
      itemsCount: 1
    });

    renderWithRouter(<MovesCard movements={[movement]} />);

    expect(screen.getByText('Entrada · Compra')).toBeInTheDocument();
    expect(screen.getByText('+12 unidades')).toBeInTheDocument();
  });

  it('should show a withdrawal movement with the − sign and reason', () => {
    const movement = recentMovementFactory.build({
      type: 'withdrawal',
      reason: 'Venda',
      totalQuantity: 2,
      itemsCount: 1
    });

    renderWithRouter(<MovesCard movements={[movement]} />);

    expect(screen.getByText('Saída · Venda')).toBeInTheDocument();
    expect(screen.getByText('−2 unidades')).toBeInTheDocument();
  });

  it('should show the link to the full history', () => {
    renderWithRouter(<MovesCard movements={[recentMovementFactory.build()]} />);

    const link = screen.getByRole('link', { name: 'Ver histórico' });
    expect(link).toHaveAttribute('href', '/movements');
  });

  it('should show neutral microcopy when there are no recent movements', () => {
    renderWithRouter(<MovesCard movements={[]} />);

    expect(
      screen.getByText('Nenhuma movimentação recente.')
    ).toBeInTheDocument();
  });
});
