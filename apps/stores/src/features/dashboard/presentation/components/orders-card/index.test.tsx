import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { recentOrderFactory } from '../../../tests/factories/recent-activity.factory';

import { OrdersCard } from '.';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('OrdersCard', () => {
  it('should show customer name, code, status badge and value', () => {
    const order = recentOrderFactory.build({
      code: '408A2517',
      customerName: 'Mariana Alves',
      status: 'confirmed',
      total: 239.4
    });

    renderWithRouter(<OrdersCard orders={[order]} />);

    expect(screen.getByText('Mariana Alves')).toBeInTheDocument();
    expect(screen.getByText('#408A2517')).toBeInTheDocument();
    expect(screen.getByText('Confirmado')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*239,40/)).toBeInTheDocument();
  });

  it('should fall back to "Cliente não identificado" when there is no customer name', () => {
    const order = recentOrderFactory.build({ customerName: undefined });

    renderWithRouter(<OrdersCard orders={[order]} />);

    expect(screen.getByText('Cliente não identificado')).toBeInTheDocument();
  });

  it('should show the link to the orders panel', () => {
    renderWithRouter(<OrdersCard orders={[recentOrderFactory.build()]} />);

    const link = screen.getByRole('link', { name: 'Ver painel' });
    expect(link).toHaveAttribute('href', '/pedidos');
  });

  it('should show neutral microcopy when there are no recent orders', () => {
    renderWithRouter(<OrdersCard orders={[]} />);

    expect(screen.getByText('Nenhum pedido recente.')).toBeInTheDocument();
  });
});
