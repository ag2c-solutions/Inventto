import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MoneyInput } from './money-input';

describe('MoneyInput', () => {
  it('should render empty string when value is null', () => {
    render(<MoneyInput value={null} onChange={vi.fn()} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('');
  });

  it('should format cents to pt-BR currency format on render', () => {
    render(<MoneyInput value={1500} onChange={vi.fn()} />);

    const input = screen.getByRole('textbox');

    expect(input).toHaveValue('15,00');
  });

  it('should handle single digit correctly', () => {
    render(<MoneyInput value={5} onChange={vi.fn()} />);

    const input = screen.getByRole('textbox');

    expect(input).toHaveValue('0,05');
  });

  it('should call onChange with parsed cents when user types', () => {
    const onChange = vi.fn();

    render(<MoneyInput value={null} onChange={onChange} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '15' } });

    expect(onChange).toHaveBeenCalledWith(15);
  });

  it('should call onChange with null when input is cleared', () => {
    const onChange = vi.fn();

    render(<MoneyInput value={1500} onChange={onChange} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '' } });

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('should ignore non-numeric characters on change', () => {
    const onChange = vi.fn();

    render(<MoneyInput value={null} onChange={onChange} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '15abc' } });

    expect(onChange).toHaveBeenCalledWith(15);
  });
});
