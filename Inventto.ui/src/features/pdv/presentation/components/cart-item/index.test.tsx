import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { cartItemFactory } from '../../../tests/factories/cart-item.factory';

import { CartItemRow } from './index';

describe('CartItemRow', () => {
  const user = userEvent.setup();

  it('should render name, variant and the final subtotal without a discount line', () => {
    const item = cartItemFactory.build({
      name: 'Cadeira Ergonômica',
      variantLabel: 'Cor: Azul',
      unitPrice: 10000,
      discount: 0,
      quantity: 2
    });

    render(
      <CartItemRow
        item={item}
        availableStock={10}
        onUpdateQty={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText('Cadeira Ergonômica')).toBeInTheDocument();
    // parseVariantValues extrai só o valor após ':', portanto 'Cor: Azul' → badge 'Azul'
    expect(screen.getByText('Azul')).toBeInTheDocument();
    expect(screen.getByText(/200,00/)).toBeInTheDocument();
    expect(screen.queryByText(/Desconto:/)).not.toBeInTheDocument();
  });

  it('should show the discount line, the struck-through reference subtotal and the final subtotal', () => {
    const item = cartItemFactory.build({
      unitPrice: 10000,
      discount: 1500,
      quantity: 2
    });

    render(
      <CartItemRow
        item={item}
        availableStock={10}
        onUpdateQty={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText(/Desconto: − R\$ 15,00/)).toBeInTheDocument();
    // Referência (200,00) riscada + final (170,00)
    expect(screen.getByText(/200,00/)).toBeInTheDocument();
    expect(screen.getByText(/170,00/)).toBeInTheDocument();
  });

  it('should show the warn state and helper text when quantity exceeds available stock', () => {
    const item = cartItemFactory.build({ quantity: 5 });

    render(
      <CartItemRow
        item={item}
        availableStock={3}
        onUpdateQty={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText('Apenas 3 disponíveis.')).toBeInTheDocument();
    const row = screen
      .getByText(item.name)
      .closest('[data-slot="pdv-cart-item"]');
    expect(row).toHaveAttribute('data-state', 'is-warn');
  });

  it('should call onUpdateQty and onRemove when interacted with', async () => {
    const onUpdateQty = vi.fn();
    const onRemove = vi.fn();
    const item = cartItemFactory.build({ quantity: 2 });

    render(
      <CartItemRow
        item={item}
        availableStock={10}
        onUpdateQty={onUpdateQty}
        onRemove={onRemove}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Aumentar quantidade' })
    );
    expect(onUpdateQty).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole('button', { name: 'Remover item' }));
    expect(onRemove).toHaveBeenCalled();
  });
});
