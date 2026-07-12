import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LayoutSegmented } from './index';

describe('LayoutSegmented', () => {
  const user = userEvent.setup();

  it('should mark the current value as checked', () => {
    render(<LayoutSegmented value="grid" onChange={vi.fn()} />);

    expect(screen.getByRole('radio', { name: 'Grade' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('radio', { name: 'Lista' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });

  it('should call onChange with "list" when Lista is clicked', async () => {
    const onChange = vi.fn();
    render(<LayoutSegmented value="grid" onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: 'Lista' }));

    expect(onChange).toHaveBeenCalledWith('list');
  });

  it('should call onChange with "grid" when Grade is clicked', async () => {
    const onChange = vi.fn();
    render(<LayoutSegmented value="list" onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: 'Grade' }));

    expect(onChange).toHaveBeenCalledWith('grid');
  });

  it('should disable both options when disabled', () => {
    render(<LayoutSegmented value="grid" onChange={vi.fn()} disabled />);

    expect(screen.getByRole('radio', { name: 'Grade' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Lista' })).toBeDisabled();
  });
});
