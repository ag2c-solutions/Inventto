import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ImportSourceSelect } from '.';

beforeEach(() => {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('ImportSourceSelect', () => {
  const options = [
    { id: 'org-1', name: 'Loja Centro' },
    { id: 'org-2', name: 'Loja Norte' }
  ];

  it('should render the placeholder when no value is selected', () => {
    render(<ImportSourceSelect options={options} onChange={vi.fn()} />);

    expect(
      screen.getByText('Selecione a unidade de origem')
    ).toBeInTheDocument();
  });

  it('should call onChange when an option is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ImportSourceSelect options={options} onChange={onChange} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByText('Loja Norte'));

    expect(onChange).toHaveBeenCalledWith('org-2');
  });

  it('should render all provided options', async () => {
    const user = userEvent.setup();

    render(<ImportSourceSelect options={options} onChange={vi.fn()} />);

    await user.click(screen.getByRole('combobox'));

    expect(await screen.findByText('Loja Centro')).toBeInTheDocument();
    expect(screen.getByText('Loja Norte')).toBeInTheDocument();
  });
});
