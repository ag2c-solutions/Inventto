import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { orderFactory } from '../../../tests/factories/order.factory';

import { CancelOrderDialog } from './index';

const { mockMutateAsync, mockUseCancelOrderMutation } = vi.hoisted(() => ({
  mockMutateAsync: vi.fn(),
  mockUseCancelOrderMutation: vi.fn()
}));

vi.mock('../../hooks/use-mutations', () => ({
  useCancelOrderMutation: mockUseCancelOrderMutation
}));

describe('CancelOrderDialog', () => {
  const user = userEvent.setup();
  const order = orderFactory.build({
    id: 'o1',
    code: 'ABC12345',
    microState: 'picking'
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCancelOrderMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });
  });

  it('should show the exact microcopy with the order code', () => {
    render(<CancelOrderDialog order={order} open onOpenChange={vi.fn()} />);

    expect(screen.getByText('Cancelar pedido #ABC12345?')).toBeInTheDocument();
    expect(
      screen.getByText(
        'A reserva de estoque será desfeita. Selecione o motivo do cancelamento para registrar nas métricas do negócio.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Falta de estoque')).toBeInTheDocument();
    expect(screen.getByText('Cliente solicitou')).toBeInTheDocument();
    expect(screen.getByText('Dados inválidos')).toBeInTheDocument();
    expect(screen.getByText('Área não atendida')).toBeInTheDocument();
  });

  it('should keep "Confirmar cancelamento" disabled until a reason is selected', () => {
    render(<CancelOrderDialog order={order} open onOpenChange={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Confirmar cancelamento' })
    ).toBeDisabled();
  });

  it('should enable "Confirmar cancelamento" once a reason is selected', async () => {
    render(<CancelOrderDialog order={order} open onOpenChange={vi.fn()} />);

    await user.click(screen.getByText('Falta de estoque'));

    expect(
      screen.getByRole('button', { name: 'Confirmar cancelamento' })
    ).toBeEnabled();
  });

  it('should call the mutation with the id/microState/reason and close on success', async () => {
    mockMutateAsync.mockResolvedValue(undefined);
    const onOpenChange = vi.fn();

    render(
      <CancelOrderDialog order={order} open onOpenChange={onOpenChange} />
    );

    await user.click(screen.getByText('Cliente solicitou'));
    await user.click(
      screen.getByRole('button', { name: 'Confirmar cancelamento' })
    );

    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: 'o1',
      microState: 'picking',
      reason: 'Cliente solicitou'
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show "Cancelando…" and lock the form while the mutation is pending (saving)', () => {
    mockUseCancelOrderMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true
    });

    render(<CancelOrderDialog order={order} open onOpenChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Cancelando…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeDisabled();
  });

  it('should render nothing when there is no order', () => {
    const { container } = render(
      <CancelOrderDialog order={undefined} open onOpenChange={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
