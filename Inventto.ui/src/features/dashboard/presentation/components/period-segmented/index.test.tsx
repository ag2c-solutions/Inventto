import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PeriodSegmented } from '.';

describe('PeriodSegmented', () => {
  it('should show the four periods with 30 dias as the default selection', () => {
    render(<PeriodSegmented value="30d" onChange={vi.fn()} />);

    expect(screen.getByRole('tab', { name: 'Hoje' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '7 dias' })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: '30 dias', selected: true })
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '90 dias' })).toBeInTheDocument();
  });

  it('should call onChange with the selected period when switched', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PeriodSegmented value="30d" onChange={onChange} />);

    await user.click(screen.getByRole('tab', { name: '7 dias' }));

    expect(onChange).toHaveBeenCalledWith('7d');
  });
});
