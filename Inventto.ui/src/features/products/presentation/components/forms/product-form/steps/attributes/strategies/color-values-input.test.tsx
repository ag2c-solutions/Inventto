import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ColorValuesInput } from './color-values-input';

beforeEach(() => {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('ColorValuesInput', () => {
  it('should render existing colors parsed from "name|hex" values', () => {
    render(<ColorValuesInput values={['Azul|#0000ff']} onChange={vi.fn()} />);

    expect(screen.getByText('Azul')).toBeInTheDocument();
  });

  it('should add a new color through the dialog', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ColorValuesInput values={[]} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Adicionar cor' }));
    await user.type(screen.getByLabelText('Nome da cor'), 'Vermelho');

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onChange).toHaveBeenCalledWith(['Vermelho|#000000']);
  });

  it('should disable saving until a color name is provided', async () => {
    const user = userEvent.setup();

    render(<ColorValuesInput values={[]} onChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Adicionar cor' }));

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  it('should remove a color when its remove button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ColorValuesInput
        values={['Azul|#0000ff', 'Preto|#000000']}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Remover cor Azul' }));

    expect(onChange).toHaveBeenCalledWith(['Preto|#000000']);
  });
});
