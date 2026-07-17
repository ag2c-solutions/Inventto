import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DiscountFields } from './index';

describe('DiscountFields', () => {
  const user = userEvent.setup();

  it('should hide the fields when disabled', () => {
    render(
      <DiscountFields
        enabled={false}
        onToggle={vi.fn()}
        mode="amount"
        onModeChange={vi.fn()}
        value={0}
        onValueChange={vi.fn()}
        referencePrice={10000}
        discountAmount={0}
        unitFinalPrice={10000}
        invalid={false}
      />
    );

    expect(screen.queryByText('Referência')).not.toBeInTheDocument();
  });

  it('should show the readout (reference, discount, final price) when enabled', () => {
    render(
      <DiscountFields
        enabled
        onToggle={vi.fn()}
        mode="amount"
        onModeChange={vi.fn()}
        value={1500}
        onValueChange={vi.fn()}
        referencePrice={10000}
        discountAmount={1500}
        unitFinalPrice={8500}
        invalid={false}
      />
    );

    expect(screen.getByText('Referência')).toBeInTheDocument();
    expect(screen.getByText(/100,00/)).toBeInTheDocument();
    expect(screen.getByText(/15,00/)).toBeInTheDocument();
    expect(screen.getByText(/85,00/)).toBeInTheDocument();
  });

  it('should call onToggle when the switch is clicked', async () => {
    const onToggle = vi.fn();

    render(
      <DiscountFields
        enabled={false}
        onToggle={onToggle}
        mode="amount"
        onModeChange={vi.fn()}
        value={0}
        onValueChange={vi.fn()}
        referencePrice={10000}
        discountAmount={0}
        unitFinalPrice={10000}
        invalid={false}
      />
    );

    await user.click(screen.getByRole('switch', { name: 'Aplicar desconto' }));

    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('should call onModeChange when switching between R$ and %', async () => {
    const onModeChange = vi.fn();

    render(
      <DiscountFields
        enabled
        onToggle={vi.fn()}
        mode="amount"
        onModeChange={onModeChange}
        value={0}
        onValueChange={vi.fn()}
        referencePrice={10000}
        discountAmount={0}
        unitFinalPrice={10000}
        invalid={false}
      />
    );

    await user.click(screen.getByRole('button', { name: '%' }));

    expect(onModeChange).toHaveBeenCalledWith('percent');
  });

  it('should show the error message when invalid', () => {
    render(
      <DiscountFields
        enabled
        onToggle={vi.fn()}
        mode="amount"
        onModeChange={vi.fn()}
        value={15000}
        onValueChange={vi.fn()}
        referencePrice={10000}
        discountAmount={10000}
        unitFinalPrice={0}
        invalid
        errorMessage="O desconto não pode ser maior que o preço de referência."
      />
    );

    expect(
      screen.getByText(
        'O desconto não pode ser maior que o preço de referência.'
      )
    ).toBeInTheDocument();
  });
});
