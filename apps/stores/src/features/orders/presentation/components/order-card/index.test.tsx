import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Package } from 'lucide-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { orderFactory } from '../../../tests/factories/order.factory';

import { OrderCard } from './index';

const { mockUseOrderCardActions } = vi.hoisted(() => ({
  mockUseOrderCardActions: vi.fn()
}));

vi.mock('./hooks/use-order-card-actions', () => ({
  useOrderCardActions: mockUseOrderCardActions
}));

describe('OrderCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.hasPointerCapture = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    mockUseOrderCardActions.mockReturnValue({
      chatAction: { label: 'Iniciar atendimento', variant: 'primary' },
      menuActions: [],
      isMenuDisabled: true,
      onOpenDetail: vi.fn(),
      isPending: false
    });
  });

  it('should open the detail (Sheet) when the body is clicked', async () => {
    const user = userEvent.setup();
    const onOpenDetail = vi.fn();
    mockUseOrderCardActions.mockReturnValue({
      chatAction: { label: 'Iniciar atendimento', variant: 'primary' },
      menuActions: [],
      isMenuDisabled: true,
      onOpenDetail,
      isPending: false
    });
    const order = orderFactory.build({ customerName: 'Joana Silva' });

    render(
      <OrderCard
        order={order}
        onOpenDetail={vi.fn()}
        onCancelRequest={vi.fn()}
      />
    );

    await user.click(screen.getByText('Joana Silva'));

    expect(onOpenDetail).toHaveBeenCalled();
  });

  it('should show "Iniciar atendimento" as primary with the menu disabled for pool orders', () => {
    const order = orderFactory.build({ macroState: 'pool' });

    render(
      <OrderCard
        order={order}
        onOpenDetail={vi.fn()}
        onCancelRequest={vi.fn()}
      />
    );

    expect(screen.getByText('Iniciar atendimento')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Ações do pedido' })
    ).toBeDisabled();
  });

  it('should render the enabled menu actions for attending orders', () => {
    mockUseOrderCardActions.mockReturnValue({
      chatAction: {
        label: 'Abrir WhatsApp',
        variant: 'ghost',
        onClick: vi.fn()
      },
      menuActions: [
        { label: 'Iniciar separação', icon: Package, onClick: vi.fn() }
      ],
      isMenuDisabled: false,
      onOpenDetail: vi.fn(),
      isPending: false
    });
    const order = orderFactory.build({
      macroState: 'attending',
      microState: 'confirming'
    });

    render(
      <OrderCard
        order={order}
        onOpenDetail={vi.fn()}
        onCancelRequest={vi.fn()}
      />
    );

    expect(screen.getByText('Abrir WhatsApp')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Ações do pedido' })
    ).not.toBeDisabled();
  });

  it('should show the "Novo" flag for isNew orders', () => {
    const order = orderFactory.build();

    render(
      <OrderCard
        order={order}
        isNew
        onOpenDetail={vi.fn()}
        onCancelRequest={vi.fn()}
      />
    );

    expect(screen.getByText('Novo')).toBeInTheDocument();
  });

  it('should render the total, item count and code', () => {
    const order = orderFactory.build({
      code: 'ABCD1234',
      total: 199.9,
      items: [
        { name: 'Produto A', quantity: 1, unitPrice: 99.9 },
        { name: 'Produto B', quantity: 1, unitPrice: 100 }
      ]
    });

    render(
      <OrderCard
        order={order}
        onOpenDetail={vi.fn()}
        onCancelRequest={vi.fn()}
      />
    );

    expect(screen.getByText('ABCD1234')).toBeInTheDocument();
    expect(screen.getByText('2 itens')).toBeInTheDocument();
    expect(screen.getByText('R$ 199,90')).toBeInTheDocument();
  });
});
