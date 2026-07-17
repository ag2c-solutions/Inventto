import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  movementFactory,
  movementItemFactory
} from '../../../tests/factories/movement.factory';

import { CancelSaleAction } from '.';

const { mockMutateAsync, mockUseCancelConfirmedSaleMutation } = vi.hoisted(
  () => ({
    mockMutateAsync: vi.fn(),
    mockUseCancelConfirmedSaleMutation: vi.fn()
  })
);

vi.mock('../../hooks/use-mutations', () => ({
  useCancelConfirmedSaleMutation: mockUseCancelConfirmedSaleMutation
}));

vi.mock('@/features/permissions', () => ({
  ActionButton: ({
    action: _action,
    children,
    ...props
  }: React.ComponentProps<'button'> & { action: string }) => (
    <button {...props}>{children}</button>
  )
}));

describe('CancelSaleAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCancelConfirmedSaleMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });
  });

  const CONFIRMED_SALE = movementFactory.build({
    reason: 'Venda',
    orderId: 'order-1',
    orderStatus: 'confirmed',
    executedAt: new Date('2024-03-15T10:30:00'),
    items: [
      movementItemFactory.build({ quantity: 2, unitPrice: 50 }),
      movementItemFactory.build({ quantity: 1, unitPrice: 39.4 })
    ]
  });

  it('should render the trigger for a confirmed sale linked to an order', () => {
    render(<CancelSaleAction movement={CONFIRMED_SALE} />);

    expect(
      screen.getByRole('button', { name: /Estornar venda/ })
    ).toBeInTheDocument();
  });

  it('should render nothing when the movement reason is not "Venda"', () => {
    const movement = movementFactory.build({
      reason: 'Compra',
      orderId: 'order-1',
      orderStatus: 'confirmed'
    });

    const { container } = render(<CancelSaleAction movement={movement} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when there is no linked order', () => {
    const movement = movementFactory.build({
      reason: 'Venda',
      orderId: undefined,
      orderStatus: undefined
    });

    const { container } = render(<CancelSaleAction movement={movement} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when the linked order is no longer confirmed', () => {
    const movement = movementFactory.build({
      reason: 'Venda',
      orderId: 'order-1',
      orderStatus: 'cancelled'
    });

    const { container } = render(<CancelSaleAction movement={movement} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should show the sale summary (date, item count and value) when opened', async () => {
    const user = userEvent.setup();
    render(<CancelSaleAction movement={CONFIRMED_SALE} />);

    await user.click(screen.getByRole('button', { name: /Estornar venda/ }));

    expect(screen.getByText('15/03/2024 · 10:30')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    // 2 * 50 + 1 * 39.4 = 139.40
    expect(screen.getByText('R$ 139,40')).toBeInTheDocument();
  });

  it('should show all 6 approved reasons', async () => {
    const user = userEvent.setup();
    render(<CancelSaleAction movement={CONFIRMED_SALE} />);

    await user.click(screen.getByRole('button', { name: /Estornar venda/ }));

    expect(screen.getByText('Cliente desistiu da compra')).toBeInTheDocument();
    expect(
      screen.getByText('Produto com defeito ou avariado')
    ).toBeInTheDocument();
    expect(screen.getByText('Erro no registro da venda')).toBeInTheDocument();
    expect(screen.getByText('Venda duplicada')).toBeInTheDocument();
    expect(
      screen.getByText('Pagamento não aprovado / estornado pela operadora')
    ).toBeInTheDocument();
    expect(screen.getByText('Outro')).toBeInTheDocument();
  });

  it('should keep the confirm button disabled until a reason is selected', async () => {
    const user = userEvent.setup();
    render(<CancelSaleAction movement={CONFIRMED_SALE} />);

    await user.click(screen.getByRole('button', { name: /Estornar venda/ }));

    const confirmButton = screen.getByRole('button', {
      name: 'Confirmar estorno'
    });
    expect(confirmButton).toBeDisabled();

    await user.click(screen.getByText('Cliente desistiu da compra'));

    expect(confirmButton).toBeEnabled();
  });

  it('should call the mutation with orderId and the selected reason, then close the dialog on success', async () => {
    mockMutateAsync.mockResolvedValue('new-movement-id');
    const user = userEvent.setup();
    render(<CancelSaleAction movement={CONFIRMED_SALE} />);

    await user.click(screen.getByRole('button', { name: /Estornar venda/ }));
    await user.click(screen.getByText('Produto com defeito ou avariado'));
    await user.click(screen.getByRole('button', { name: 'Confirmar estorno' }));

    expect(mockMutateAsync).toHaveBeenCalledWith({
      orderId: 'order-1',
      reason: 'Produto com defeito ou avariado'
    });

    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Confirmar estorno' })
      ).not.toBeInTheDocument()
    );
  });

  it('should show a pending state while the mutation is in flight', async () => {
    mockUseCancelConfirmedSaleMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true
    });
    const user = userEvent.setup();
    render(<CancelSaleAction movement={CONFIRMED_SALE} />);

    await user.click(screen.getByRole('button', { name: /Estornar venda/ }));

    expect(screen.getByText('Estornando…')).toBeInTheDocument();
  });
});
