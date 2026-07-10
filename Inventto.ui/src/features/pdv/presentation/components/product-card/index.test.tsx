import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { pdvProductFactory } from '../../../tests/factories/pdv-product.factory';

import { ProductCard } from './index';

describe('ProductCard', () => {
  const user = userEvent.setup();

  it('should render the product name, variant label and price', () => {
    const product = pdvProductFactory.build({
      name: 'Cadeira Ergonômica',
      price: 8990
    });

    render(<ProductCard product={product} onAdd={vi.fn()} />);

    expect(screen.getByText('Cadeira Ergonômica')).toBeInTheDocument();
    expect(screen.getByText(/89,90/)).toBeInTheDocument();
  });

  it('should call onAdd with the product when the trigger is clicked', async () => {
    const product = pdvProductFactory.build();
    const onAdd = vi.fn();

    render(<ProductCard product={product} onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: 'Adicionar produto' }));

    expect(onAdd).toHaveBeenCalledWith(product);
  });

  it('should show the "esgotado" badge and disable the trigger when out of stock', () => {
    const product = pdvProductFactory.build({ stock: 0, isOut: true });

    render(<ProductCard product={product} onAdd={vi.fn()} />);

    expect(screen.getByText('esgotado')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Adicionar produto' })
    ).toBeDisabled();
  });

  it('should keep the trigger enabled when in stock', () => {
    const product = pdvProductFactory.build({ stock: 5, isOut: false });

    render(<ProductCard product={product} onAdd={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Adicionar produto' })
    ).toBeEnabled();
    expect(screen.queryByText('esgotado')).not.toBeInTheDocument();
  });
});
