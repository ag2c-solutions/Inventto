import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { QtyStepper } from './index';

describe('QtyStepper', () => {
  const user = userEvent.setup();

  it('should render the current value', () => {
    render(
      <QtyStepper
        value={3}
        onIncrement={vi.fn()}
        onDecrement={vi.fn()}
        decrementDisabled={false}
        incrementDisabled={false}
      />
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should disable the decrement button at the minimum', () => {
    render(
      <QtyStepper
        value={1}
        onIncrement={vi.fn()}
        onDecrement={vi.fn()}
        decrementDisabled
        incrementDisabled={false}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Diminuir quantidade' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Aumentar quantidade' })
    ).toBeEnabled();
  });

  it('should disable the increment button at the available balance', () => {
    render(
      <QtyStepper
        value={5}
        onIncrement={vi.fn()}
        onDecrement={vi.fn()}
        decrementDisabled={false}
        incrementDisabled
      />
    );

    expect(
      screen.getByRole('button', { name: 'Aumentar quantidade' })
    ).toBeDisabled();
  });

  it('should show the low-balance helper text when provided', () => {
    render(
      <QtyStepper
        value={4}
        onIncrement={vi.fn()}
        onDecrement={vi.fn()}
        decrementDisabled={false}
        incrementDisabled
        helperText="Apenas 4 disponíveis."
      />
    );

    expect(screen.getByText('Apenas 4 disponíveis.')).toBeInTheDocument();
  });

  it('should call onIncrement and onDecrement when clicked', async () => {
    const onIncrement = vi.fn();
    const onDecrement = vi.fn();

    render(
      <QtyStepper
        value={2}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        decrementDisabled={false}
        incrementDisabled={false}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Aumentar quantidade' })
    );
    await user.click(
      screen.getByRole('button', { name: 'Diminuir quantidade' })
    );

    expect(onIncrement).toHaveBeenCalledTimes(1);
    expect(onDecrement).toHaveBeenCalledTimes(1);
  });
});
