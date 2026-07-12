import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Order } from '../../../domain/entities';
import { orderFactory } from '../../../tests/factories/order.factory';

import { OrdersBoard } from './index';

vi.mock('../order-card', () => ({
  OrderCard: ({ order }: { order: Order }) => <div>{order.customerName}</div>
}));

describe('OrdersBoard', () => {
  it('should render the 4 macro-state columns with counters', () => {
    const orders = [
      orderFactory.build({ macroState: 'pool' }),
      orderFactory.build({ macroState: 'attending' }),
      orderFactory.build({ macroState: 'attending' }),
      orderFactory.build({ macroState: 'done' }),
      orderFactory.build({ macroState: 'cancelled' })
    ];

    render(
      <OrdersBoard
        orders={orders}
        onOpenDetail={vi.fn()}
        onCancelRequest={vi.fn()}
      />
    );

    expect(screen.getByText('Pool')).toBeInTheDocument();
    expect(screen.getByText('Em atendimento')).toBeInTheDocument();
    expect(screen.getByText('Finalizados')).toBeInTheDocument();
    expect(screen.getByText('Cancelados')).toBeInTheDocument();
  });

  it('should place each order under its macro-state column', () => {
    const orders = [
      orderFactory.build({
        macroState: 'pool',
        customerName: 'Pedido do Pool'
      }),
      orderFactory.build({
        macroState: 'done',
        customerName: 'Pedido Finalizado'
      })
    ];

    render(
      <OrdersBoard
        orders={orders}
        onOpenDetail={vi.fn()}
        onCancelRequest={vi.fn()}
      />
    );

    expect(screen.getByText('Pedido do Pool')).toBeInTheDocument();
    expect(screen.getByText('Pedido Finalizado')).toBeInTheDocument();
  });

  it('should sort the "Em atendimento" column by last action (most recent first)', () => {
    const older = orderFactory.build({
      macroState: 'attending',
      customerName: 'Pedido Antigo',
      lastActionAt: new Date('2026-07-01T10:00:00Z')
    });
    const newer = orderFactory.build({
      macroState: 'attending',
      customerName: 'Pedido Recente',
      lastActionAt: new Date('2026-07-05T10:00:00Z')
    });

    render(
      <OrdersBoard
        orders={[older, newer]}
        onOpenDetail={vi.fn()}
        onCancelRequest={vi.fn()}
      />
    );

    const names = screen
      .getAllByText(/Pedido (Antigo|Recente)/)
      .map((el) => el.textContent);

    expect(names).toEqual(['Pedido Recente', 'Pedido Antigo']);
  });

  it('should show the wireframe microcopy for each empty column', () => {
    render(
      <OrdersBoard
        orders={[]}
        onOpenDetail={vi.fn()}
        onCancelRequest={vi.fn()}
      />
    );

    expect(
      screen.getByText(
        'Nenhum pedido pendente. Os novos chegam aqui em tempo real.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Nenhum pedido em atendimento agora.')
    ).toBeInTheDocument();
    expect(
      screen.getAllByText('Nenhum pedido encerrado neste período.')
    ).toHaveLength(2);
  });
});
