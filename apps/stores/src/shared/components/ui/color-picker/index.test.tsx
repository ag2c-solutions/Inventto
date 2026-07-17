import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ColorPicker } from './index';

describe('ColorPicker', () => {
  const user = userEvent.setup();

  it('should render the current hex value in both the swatch and the text input', () => {
    render(<ColorPicker value="#3a3631" onChange={vi.fn()} />);

    expect(screen.getByLabelText('Selecionar cor')).toHaveValue('#3a3631');
    expect(screen.getByPlaceholderText('#000000')).toHaveValue('#3a3631');
  });

  it('should call onChange when a valid hex is typed', async () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#000000" onChange={onChange} />);

    const textInput = screen.getByPlaceholderText('#000000');
    await user.clear(textInput);
    await user.type(textInput, '#ffffff');

    expect(onChange).toHaveBeenLastCalledWith('#ffffff');
  });

  it('should not call onChange while the typed hex is incomplete/invalid', async () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#000000" onChange={onChange} />);

    const textInput = screen.getByPlaceholderText('#000000');
    await user.clear(textInput);
    await user.type(textInput, '#fff0');

    expect(onChange).not.toHaveBeenCalledWith('#fff0');
  });

  it('should mark aria-invalid while the typed hex is incomplete', async () => {
    render(<ColorPicker value="#000000" onChange={vi.fn()} />);

    const textInput = screen.getByPlaceholderText('#000000');
    await user.clear(textInput);
    await user.type(textInput, '#zzz');

    expect(textInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('should disable both controls when disabled', () => {
    render(<ColorPicker value="#000000" onChange={vi.fn()} disabled />);

    expect(screen.getByLabelText('Selecionar cor')).toBeDisabled();
    expect(screen.getByPlaceholderText('#000000')).toBeDisabled();
  });
});
