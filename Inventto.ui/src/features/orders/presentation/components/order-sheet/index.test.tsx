import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Flag, Play } from 'lucide-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { orderFactory } from '../../../tests/factories/order.factory';
import { useOrderSheetStore } from '../../stores/order-sheet-store';

import { OrderSheet } from './index';

const { mockUseOrderQuery, mockUseOrderSheetActions } = vi.hoisted(() => ({
  mockUseOrderQuery: vi.fn(),
  mockUseOrderSheetActions: vi.fn()
}));

vi.mock('../../hooks/use-queries', () => ({
  useOrderQuery: mockUseOrderQuery
}));

vi.mock('./hooks/use-order-sheet-actions', () => ({
  useOrderSheetActions: mockUseOrderSheetActions
}));

describe('OrderSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    act(() => {
      useOrderSheetStore.getState().close();
    });
    mockUseOrderSheetActions.mockReturnValue({
      primaryAction: {
        label: 'Iniciar atendimento',
        icon: Play,
        onClick: vi.fn()
      },
      onCancel: undefined,
      isSaving: false,
      savingLabel: undefined
    });
  });

  it('should not render content when there is no order open', () => {
    mockUseOrderQuery.mockReturnValue({ data: undefined, isLoading: false });

    render(<OrderSheet onCancelRequest={vi.fn()} />);

    expect(screen.queryByText(/^#/)).not.toBeInTheDocument();
  });

  it('should compose the 4 cards for the opened order', () => {
    const order = orderFactory.build({
      customerName: 'Mariana Alves',
      address: { street: 'Av. Paulista', number: '1578' }
    });
    mockUseOrderQuery.mockReturnValue({ data: order, isLoading: false });

    act(() => {
      useOrderSheetStore.getState().open(order.id);
    });

    render(<OrderSheet onCancelRequest={vi.fn()} />);

    expect(screen.getByText('Mariana Alves')).toBeInTheDocument();
    expect(
      screen.getByText(`Itens · ${order.items.length}`)
    ).toBeInTheDocument();
    expect(screen.getByText('Av. Paulista, 1578')).toBeInTheDocument();
    expect(screen.getByText('Detalhes')).toBeInTheDocument();
  });

  it('should open WhatsApp via the customer card link', () => {
    const order = orderFactory.build({ customerPhone: '(11) 98765-4321' });
    mockUseOrderQuery.mockReturnValue({ data: order, isLoading: false });

    act(() => {
      useOrderSheetStore.getState().open(order.id);
    });

    render(<OrderSheet onCancelRequest={vi.fn()} />);

    const link = screen.getByRole('link', { name: /Chamar no WhatsApp/ });
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/5511987654321')
    );
  });

  it('should show "Pedido não encontrado" for 404/sem permissão', () => {
    mockUseOrderQuery.mockReturnValue({ data: undefined, isLoading: false });

    act(() => {
      useOrderSheetStore.getState().open('missing');
    });

    render(<OrderSheet onCancelRequest={vi.fn()} />);

    expect(screen.getByText('Pedido não encontrado')).toBeInTheDocument();
  });

  it('should close the sheet when "Finalizar pedido" succeeds (onFinalized)', async () => {
    const user = userEvent.setup();
    const order = orderFactory.build({
      macroState: 'attending',
      microState: 'delivering'
    });
    mockUseOrderQuery.mockReturnValue({ data: order, isLoading: false });
    mockUseOrderSheetActions.mockImplementation(({ onFinalized }) => ({
      primaryAction: {
        label: 'Finalizar pedido',
        icon: Flag,
        onClick: onFinalized
      },
      onCancel: vi.fn(),
      isSaving: false,
      savingLabel: undefined
    }));

    act(() => {
      useOrderSheetStore.getState().open(order.id);
    });

    render(<OrderSheet onCancelRequest={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Finalizar pedido' }));

    expect(useOrderSheetStore.getState().orderId).toBeNull();
  });

  it('should call onCancelRequest when "Cancelar" is triggered', async () => {
    const user = userEvent.setup();
    const order = orderFactory.build({
      macroState: 'attending',
      microState: 'picking'
    });
    const onCancelRequest = vi.fn();
    mockUseOrderQuery.mockReturnValue({ data: order, isLoading: false });
    mockUseOrderSheetActions.mockReturnValue({
      primaryAction: {
        label: 'Despachar entrega',
        icon: Flag,
        onClick: vi.fn()
      },
      onCancel: () => onCancelRequest(order),
      isSaving: false,
      savingLabel: undefined
    });

    act(() => {
      useOrderSheetStore.getState().open(order.id);
    });

    render(<OrderSheet onCancelRequest={onCancelRequest} />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancelRequest).toHaveBeenCalledWith(order);
  });
});
