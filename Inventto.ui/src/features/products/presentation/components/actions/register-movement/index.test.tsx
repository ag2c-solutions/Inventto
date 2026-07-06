import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseUser, mockOpenMovementSheet } = vi.hoisted(() => ({
  mockUseUser: vi.fn(),
  mockOpenMovementSheet: vi.fn()
}));

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

vi.mock('@/features/movements', () => ({
  useOpenMovementSheet: () => mockOpenMovementSheet
}));

import { RegisterProductMovementAction } from '.';

describe('RegisterProductMovementAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ role: 'sales' });
  });

  it('should open the movement sheet for the productId when clicked', async () => {
    const user = userEvent.setup();
    render(<RegisterProductMovementAction productId="prod-1" />);

    await user.click(
      screen.getByRole('button', { name: /registrar movimentação/i })
    );

    expect(mockOpenMovementSheet).toHaveBeenCalledWith('prod-1');
  });

  it('should render nothing while permissions are still loading', () => {
    mockUseUser.mockReturnValue({ role: undefined });

    render(<RegisterProductMovementAction productId="prod-1" />);

    expect(
      screen.queryByRole('button', { name: /registrar movimentação/i })
    ).not.toBeInTheDocument();
  });
});
