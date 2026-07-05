import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MovementFormHeader } from '.';

const formRef: { current: unknown } = vi.hoisted(() => ({ current: null }));
const { mockOnChangeType } = vi.hoisted(() => ({ mockOnChangeType: vi.fn() }));

vi.mock('../../hooks/use-movement-form', () => ({
  useMovementForm: () => ({
    form: formRef.current,
    reasonOptions: ['Compra', 'Devolução de cliente', 'Outro'],
    actions: { onChangeType: mockOnChangeType }
  })
}));

function Harness({ reason = '' }: { reason?: string }) {
  const form = useForm({
    defaultValues: {
      type: 'entry',
      reason,
      description: '',
      documentNumber: '',
      date: new Date(2024, 2, 15),
      time: '10:30'
    }
  });

  formRef.current = form;

  return (
    <FormProvider {...form}>
      <MovementFormHeader />
    </FormProvider>
  );
}

describe('MovementFormHeader', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the entry/withdrawal tabs and reason options', () => {
    render(<Harness />);

    expect(screen.getByText('Entrada')).toBeInTheDocument();
    expect(screen.getByText('Saída')).toBeInTheDocument();
    expect(
      screen.getByText('Compra · Devolução de cliente · Outro')
    ).toBeInTheDocument();
  });

  it('should call actions.onChangeType when switching to withdrawal', async () => {
    render(<Harness />);

    await user.click(screen.getByText('Saída'));

    expect(mockOnChangeType).toHaveBeenCalledWith('withdrawal');
  });

  it('should not show the description field when reason is not "Outro"', () => {
    render(<Harness />);

    expect(screen.queryByText('Descrição do motivo')).not.toBeInTheDocument();
  });

  it('should show the description field when reason is "Outro"', () => {
    render(<Harness reason="Outro" />);

    expect(screen.getByText('Descrição do motivo')).toBeInTheDocument();
  });

  it('should render the formatted selected date', () => {
    render(<Harness />);

    expect(screen.getByText('15/03/2024')).toBeInTheDocument();
  });
});
