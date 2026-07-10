import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { pdvProductFactory } from '../../../tests/factories/pdv-product.factory';
import { useCartStore } from '../../stores/cart-store';

import { AddProductDialog } from './index';

describe('AddProductDialog', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('should render nothing when there is no product selected', () => {
    render(<AddProductDialog product={null} onOpenChange={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should show the header with name, variant and reference price (base state)', () => {
    const product = pdvProductFactory.build({
      name: 'Cadeira Ergonômica',
      variantLabel: 'Cor: Azul',
      price: 8990,
      stock: 10
    });

    render(<AddProductDialog product={product} onOpenChange={vi.fn()} />);

    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByText('Cadeira Ergonômica')).toBeInTheDocument();
    expect(dialog.getByText('Azul')).toBeInTheDocument();
    expect(dialog.getByText(/Preço de referência.*89,90/)).toBeInTheDocument();
    expect(dialog.getByText('1')).toBeInTheDocument();
  });

  it('should show the low-balance helper when the stepper hits the limit', () => {
    const product = pdvProductFactory.build({ stock: 1 });

    render(<AddProductDialog product={product} onOpenChange={vi.fn()} />);

    expect(screen.getByText('Apenas 1 disponíveis.')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Aumentar quantidade' })
    ).toBeDisabled();
  });

  it('should recalculate the discount readout in R$ mode', async () => {
    const product = pdvProductFactory.build({ price: 10000, stock: 10 });

    render(<AddProductDialog product={product} onOpenChange={vi.fn()} />);

    await user.click(screen.getByRole('switch', { name: 'Aplicar desconto' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Valor do desconto' }),
      '1500'
    );

    expect(screen.getByText(/89,90|15,00/)).toBeInTheDocument();
    expect(screen.getByText(/85,00/)).toBeInTheDocument();
  });

  it('should disable "Adicionar" and show the error when the discount exceeds the reference (invalid state)', async () => {
    const product = pdvProductFactory.build({ price: 5000, stock: 10 });

    render(<AddProductDialog product={product} onOpenChange={vi.fn()} />);

    await user.click(screen.getByRole('switch', { name: 'Aplicar desconto' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Valor do desconto' }),
      '6000'
    );

    expect(
      screen.getByText(
        'O desconto não pode ser maior que o preço de referência.'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeDisabled();
  });

  it('should confirm and add the item to the cart with referencePrice/discountAmount/quantity', async () => {
    const product = pdvProductFactory.build({
      productId: 'p1',
      price: 10000,
      stock: 10
    });
    const onOpenChange = vi.fn();

    render(<AddProductDialog product={product} onOpenChange={onOpenChange} />);

    await user.click(
      screen.getByRole('button', { name: 'Aumentar quantidade' })
    );
    await user.click(screen.getByRole('switch', { name: 'Aplicar desconto' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Valor do desconto' }),
      '1000'
    );
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      productId: 'p1',
      unitPrice: 10000,
      discount: 1000,
      quantity: 2
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should call onOpenChange(false) when "Cancelar" is clicked, without adding to the cart', async () => {
    const product = pdvProductFactory.build({ stock: 10 });
    const onOpenChange = vi.fn();

    render(<AddProductDialog product={product} onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('should consolidate quantity when confirming an item already in the cart', async () => {
    const product = pdvProductFactory.build({
      productId: 'p1',
      variantId: undefined,
      price: 10000,
      stock: 10
    });
    useCartStore.getState().addItem({
      productId: 'p1',
      name: product.name,
      unitPrice: 10000,
      discount: 0,
      quantity: 3
    });

    render(<AddProductDialog product={product} onOpenChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(4);
  });
});
