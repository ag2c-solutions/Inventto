import { render, screen } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import type { Order } from '../../../../../domain/entities';
import { orderFactory } from '../../../../../tests/factories/order.factory';

import { BoardColumn } from './index';

vi.mock('../../../order-card', () => ({
  OrderCard: ({ order, isNew }: { order: Order; isNew?: boolean }) => (
    <div>
      {order.customerName} — {isNew ? 'novo' : 'nao-novo'}
    </div>
  )
}));

describe('BoardColumn', () => {
  it('should show the column title, count and empty microcopy when there are no orders', () => {
    render(
      <BoardColumn
        title="Pool"
        tone="neutral"
        orders={[]}
        emptyText="Nenhum pedido pendente. Os novos chegam aqui em tempo real."
        emptyIcon={Inbox}
        onOpenDetail={vi.fn()}
        onCancelRequest={vi.fn()}
      />
    );

    expect(screen.getByText('Pool')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Nenhum pedido pendente. Os novos chegam aqui em tempo real.'
      )
    ).toBeInTheDocument();
  });

  it('should render one OrderCard per order and the counter', () => {
    const orders = [
      orderFactory.build({ customerName: 'Mariana Costa' }),
      orderFactory.build({ customerName: 'Rafael Souza' })
    ];

    render(
      <BoardColumn
        title="Pool"
        tone="neutral"
        orders={orders}
        emptyText="vazio"
        emptyIcon={Inbox}
        onOpenDetail={vi.fn()}
        onCancelRequest={vi.fn()}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/Mariana Costa/)).toBeInTheDocument();
    expect(screen.getByText(/Rafael Souza/)).toBeInTheDocument();
  });

  it('should flag as new only the orders present in newOrderIds', () => {
    const orders = [
      orderFactory.build({ id: 'o1', customerName: 'Pedido Novo' }),
      orderFactory.build({ id: 'o2', customerName: 'Pedido Antigo' })
    ];

    render(
      <BoardColumn
        title="Pool"
        tone="neutral"
        orders={orders}
        emptyText="vazio"
        emptyIcon={Inbox}
        newOrderIds={new Set(['o1'])}
        onOpenDetail={vi.fn()}
        onCancelRequest={vi.fn()}
      />
    );

    expect(screen.getByText('Pedido Novo — novo')).toBeInTheDocument();
    expect(screen.getByText('Pedido Antigo — nao-novo')).toBeInTheDocument();
  });
});
