import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductFilterChip } from '.';

describe('ProductFilterChip', () => {
  it('should render the given product name', () => {
    render(
      <MemoryRouter>
        <ProductFilterChip productName="Camisa Social" />
      </MemoryRouter>
    );

    expect(screen.getByText('Camisa Social')).toBeInTheDocument();
  });

  it('should fall back to a generic label when no product name is given', () => {
    render(
      <MemoryRouter>
        <ProductFilterChip />
      </MemoryRouter>
    );

    expect(screen.getByText('Produto selecionado')).toBeInTheDocument();
  });

  it('should link to /movements to clear the filter', () => {
    render(
      <MemoryRouter>
        <ProductFilterChip productName="Camisa Social" />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('link', { name: 'Limpar filtro de produto' })
    ).toHaveAttribute('href', '/movements');
  });
});
