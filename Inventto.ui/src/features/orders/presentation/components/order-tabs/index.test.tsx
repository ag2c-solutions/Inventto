import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Order } from '../../../domain/entities';
import { orderFactory } from '../../../tests/factories/order.factory';

import { OrderTabs } from './index';

vi.mock('../order-card', () => ({
  OrderCard: ({ order }: { order: Order }) => <div>{order.customerName}</div>
}));

describe('OrderTabs', () => {
  const user = userEvent.setup();

  it('should render the 4 tabs with a counter per macro-state', () => {
    const orders = [
      orderFactory.build({ macroState: 'pool' }),
      orderFactory.build({ macroState: 'attending' }),
      orderFactory.build({ macroState: 'attending' }),
      orderFactory.build({ macroState: 'done' }),
      orderFactory.build({ macroState: 'cancelled' })
    ];

    render(
      <OrderTabs
        orders={orders}
        onOpenDetail={vi.fn()}
        onCancelRequest={vi.fn()}
      />
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      'Pool1',
      'Em atendimento2',
      'Finalizados1',
      'Cancelados1'
    ]);
  });

  it('should show only the active tab orders and switch on click', async () => {
    const poolOrder = orderFactory.build({
      macroState: 'pool',
      customerName: 'Pedido do Pool'
    });
    const doneOrder = orderFactory.build({
      macroState: 'done',
      customerName: 'Pedido Finalizado'
    });

    render(
      <OrderTabs
        orders={[poolOrder, doneOrder]}
        onOpenDetail={vi.fn()}
        onCancelRequest={vi.fn()}
      />
    );

    expect(screen.getByText('Pedido do Pool')).toBeInTheDocument();
    expect(screen.queryByText('Pedido Finalizado')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /Finalizados/ }));

    expect(screen.queryByText('Pedido do Pool')).not.toBeInTheDocument();
    expect(screen.getByText('Pedido Finalizado')).toBeInTheDocument();
  });

  it('should show the wireframe microcopy when the active tab is empty', () => {
    render(
      <OrderTabs orders={[]} onOpenDetail={vi.fn()} onCancelRequest={vi.fn()} />
    );

    expect(
      screen.getByText(
        'Nenhum pedido pendente. Os novos chegam aqui em tempo real.'
      )
    ).toBeInTheDocument();
  });

  it('should show the "attending" empty microcopy after switching tabs', async () => {
    render(
      <OrderTabs orders={[]} onOpenDetail={vi.fn()} onCancelRequest={vi.fn()} />
    );

    await user.click(screen.getByRole('tab', { name: /Em atendimento/ }));

    expect(
      screen.getByText('Nenhum pedido em atendimento agora.')
    ).toBeInTheDocument();
  });
});
