import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AddNewMovements } from '.';

const { mockUseOpenMovementSheet, mockOpen } = vi.hoisted(() => ({
  mockUseOpenMovementSheet: vi.fn(),
  mockOpen: vi.fn()
}));

vi.mock('../../hooks/use-open-movement-sheet', () => ({
  useOpenMovementSheet: mockUseOpenMovementSheet
}));

vi.mock('@/features/permissions', () => ({
  ActionButton: ({
    action: _action,
    children,
    onClick,
    ...props
  }: React.ComponentProps<'button'> & { action: string }) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  )
}));

describe('AddNewMovements', () => {
  it('should render the "Registrar" label by default', () => {
    mockUseOpenMovementSheet.mockReturnValue(mockOpen);

    render(<AddNewMovements />);

    expect(screen.getByText('Registrar')).toBeInTheDocument();
  });

  it('should hide the label when iconOnly is true', () => {
    mockUseOpenMovementSheet.mockReturnValue(mockOpen);

    render(<AddNewMovements iconOnly />);

    expect(screen.queryByText('Registrar')).not.toBeInTheDocument();
  });

  it('should open the movement sheet when clicked', async () => {
    mockUseOpenMovementSheet.mockReturnValue(mockOpen);
    const user = userEvent.setup();

    render(<AddNewMovements />);

    await user.click(screen.getByRole('button'));

    expect(mockOpen).toHaveBeenCalledTimes(1);
  });
});
