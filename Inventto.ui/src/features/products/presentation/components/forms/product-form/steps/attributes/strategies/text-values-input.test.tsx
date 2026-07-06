import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TextValuesInput } from './text-values-input';

describe('TextValuesInput', () => {
  it('should add a value when Enter is pressed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<TextValuesInput values={[]} onChange={onChange} />);

    await user.type(
      screen.getByPlaceholderText('Digite valor e Enter (ou vírgula)'),
      'Azul{Enter}'
    );

    expect(onChange).toHaveBeenCalledWith(['Azul']);
  });

  it('should add a value when comma is typed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<TextValuesInput values={[]} onChange={onChange} />);

    await user.type(
      screen.getByPlaceholderText('Digite valor e Enter (ou vírgula)'),
      'Azul,'
    );

    expect(onChange).toHaveBeenCalledWith(['Azul']);
  });

  it('should not add a duplicate value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<TextValuesInput values={['Azul']} onChange={onChange} />);

    await user.type(
      screen.getByPlaceholderText('Digite valor e Enter (ou vírgula)'),
      'Azul{Enter}'
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should only accept digits when type is "number"', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<TextValuesInput values={[]} onChange={onChange} type="number" />);

    const input = screen.getByPlaceholderText('Digite um número e Enter');

    await user.type(input, 'abc123');

    expect(input).toHaveValue('123');
  });

  it('should remove a value when its remove button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<TextValuesInput values={['Azul', 'Preto']} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Remover Azul' }));

    expect(onChange).toHaveBeenCalledWith(['Preto']);
  });
});
