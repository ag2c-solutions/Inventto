import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { orderFactory } from '../../../tests/factories/order.factory';

import { OrderItemsCard } from './index';

describe('OrderItemsCard', () => {
  it('should render every item with quantity and subtotal', () => {
    const order = orderFactory.build({
      items: [
        { name: 'Vestido de Linho', quantity: 1, unitPrice: 289.9 },
        { name: 'Camiseta Pima', quantity: 2, unitPrice: 89.9 }
      ],
      total: 469.7
    });

    render(<OrderItemsCard order={order} />);

    expect(screen.getByText('Itens · 2')).toBeInTheDocument();
    expect(screen.getByText('Vestido de Linho')).toBeInTheDocument();
    expect(screen.getByText('Camiseta Pima')).toBeInTheDocument();
    expect(screen.getByText('2×')).toBeInTheDocument();
    expect(screen.getByText('R$ 179,80')).toBeInTheDocument();
  });

  it('should render the order total', () => {
    const order = orderFactory.build({
      items: [{ name: 'Produto', quantity: 1, unitPrice: 40 }],
      total: 100
    });

    render(<OrderItemsCard order={order} />);

    expect(screen.getByText('Total do pedido')).toBeInTheDocument();
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
  });
});
