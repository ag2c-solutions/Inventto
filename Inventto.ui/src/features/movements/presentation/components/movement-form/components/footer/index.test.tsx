import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MovementFormFooter } from '.';

const { mockUseMovementForm } = vi.hoisted(() => ({
  mockUseMovementForm: vi.fn()
}));

vi.mock('../../hooks/use-movement-form', () => ({
  useMovementForm: mockUseMovementForm
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

function buildForm(values: Record<string, unknown>) {
  return {
    watch: (field: string) => values[field]
  };
}

describe('MovementFormFooter', () => {
  const cancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call actions.cancel when the cancel button is clicked', async () => {
    mockUseMovementForm.mockReturnValue({
      form: buildForm({ type: 'entry', items: [] }),
      isSubmitting: false,
      actions: { cancel }
    });
    const user = userEvent.setup();

    render(<MovementFormFooter />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('should disable submit when there are no items', () => {
    mockUseMovementForm.mockReturnValue({
      form: buildForm({ type: 'entry', items: [] }),
      isSubmitting: false,
      actions: { cancel }
    });

    render(<MovementFormFooter />);

    expect(screen.getByRole('button', { name: 'Registrar' })).toBeDisabled();
  });

  it('should enable submit when there are valid items', () => {
    mockUseMovementForm.mockReturnValue({
      form: buildForm({
        type: 'entry',
        items: [{ quantity: 2, currentStock: 5 }]
      }),
      isSubmitting: false,
      actions: { cancel }
    });

    render(<MovementFormFooter />);

    expect(
      screen.getByRole('button', { name: 'Registrar' })
    ).not.toBeDisabled();
  });

  it('should disable submit when a withdrawal item exceeds current stock', () => {
    mockUseMovementForm.mockReturnValue({
      form: buildForm({
        type: 'withdrawal',
        items: [{ quantity: 10, currentStock: 5 }]
      }),
      isSubmitting: false,
      actions: { cancel }
    });

    render(<MovementFormFooter />);

    expect(screen.getByRole('button', { name: 'Registrar' })).toBeDisabled();
  });

  it('should show the loading label and disable submit while submitting', () => {
    mockUseMovementForm.mockReturnValue({
      form: buildForm({
        type: 'entry',
        items: [{ quantity: 2, currentStock: 5 }]
      }),
      isSubmitting: true,
      actions: { cancel }
    });

    render(<MovementFormFooter />);

    expect(screen.getByText('Registrando…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrando/ })).toBeDisabled();
  });
});
