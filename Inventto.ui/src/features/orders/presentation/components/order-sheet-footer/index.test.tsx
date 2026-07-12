import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Flag } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { OrderSheetFooter } from './index';

describe('OrderSheetFooter', () => {
  it('should render only the primary action when there is no cancel (Pool)', () => {
    const onClick = vi.fn();

    render(
      <OrderSheetFooter
        primaryAction={{ label: 'Iniciar atendimento', icon: Flag, onClick }}
        isSaving={false}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Iniciar atendimento' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cancelar' })
    ).not.toBeInTheDocument();
  });

  it('should render the primary and the destructive cancel action when onCancel is provided', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onCancel = vi.fn();

    render(
      <OrderSheetFooter
        primaryAction={{ label: 'Finalizar pedido', icon: Flag, onClick }}
        onCancel={onCancel}
        isSaving={false}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Finalizar pedido' }));
    expect(onClick).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('should show the readonly note when there is no primary action (encerrado)', () => {
    render(<OrderSheetFooter isSaving={false} />);

    expect(
      screen.getByText('Pedido encerrado — somente leitura.')
    ).toBeInTheDocument();
  });

  it('should block the buttons and show the saving label while saving', () => {
    render(
      <OrderSheetFooter
        primaryAction={{
          label: 'Finalizar pedido',
          icon: Flag,
          onClick: vi.fn()
        }}
        onCancel={vi.fn()}
        isSaving
        savingLabel="Finalizando…"
      />
    );

    expect(screen.getByText('Finalizando…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Finalizando/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});
