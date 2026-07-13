import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Shortcuts } from '.';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Shortcuts', () => {
  it('should show the three shortcuts with correct routes for manager/owner', () => {
    renderWithRouter(<Shortcuts role="owner" />);

    expect(screen.getByRole('link', { name: /Nova venda/ })).toHaveAttribute(
      'href',
      '/pdv'
    );
    expect(
      screen.getByRole('link', { name: /Entrada de estoque/ })
    ).toHaveAttribute('href', '/movements');
    expect(screen.getByRole('link', { name: /Produto/ })).toHaveAttribute(
      'href',
      '/products/create'
    );
  });

  it('should show only "Nova venda" for sales', () => {
    renderWithRouter(<Shortcuts role="sales" />);

    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link', { name: /Nova venda/ })).toHaveAttribute(
      'href',
      '/pdv'
    );
  });

  it('should render "Nova venda" as the primary (solid) shortcut', () => {
    renderWithRouter(<Shortcuts role="manager" />);

    const novaVendaLink = screen.getByRole('link', { name: /Nova venda/ });
    const novaVendaButton = novaVendaLink.closest('[data-slot="button"]');
    const entradaLink = screen.getByRole('link', {
      name: /Entrada de estoque/
    });
    const entradaButton = entradaLink.closest('[data-slot="button"]');

    expect(novaVendaButton?.className).not.toEqual(entradaButton?.className);
  });
});
