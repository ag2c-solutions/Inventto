import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SelectValuesInput } from './select-values-input';

describe('SelectValuesInput', () => {
  it('should add a value when the "Adicionar" button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SelectValuesInput values={[]} onChange={onChange} />);

    await user.type(screen.getByPlaceholderText('Ex: P, M, G'), 'Pequeno');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(onChange).toHaveBeenCalledWith(['Pequeno']);
  });

  it('should add a value when Enter is pressed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SelectValuesInput values={[]} onChange={onChange} />);

    await user.type(
      screen.getByPlaceholderText('Ex: P, M, G'),
      'Pequeno{Enter}'
    );

    expect(onChange).toHaveBeenCalledWith(['Pequeno']);
  });

  it('should not add a value that already exists (case-insensitive)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SelectValuesInput values={['Pequeno']} onChange={onChange} />);

    await user.type(
      screen.getByPlaceholderText('Ex: P, M, G'),
      'pequeno{Enter}'
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should disable the "Adicionar" button when the input is blank', () => {
    render(<SelectValuesInput values={[]} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeDisabled();
  });

  it('should remove a value when its remove button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SelectValuesInput values={['Pequeno', 'Médio']} onChange={onChange} />
    );

    await user.click(
      screen.getByRole('button', { name: 'Remover opção Pequeno' })
    );

    expect(onChange).toHaveBeenCalledWith(['Médio']);
  });
});
