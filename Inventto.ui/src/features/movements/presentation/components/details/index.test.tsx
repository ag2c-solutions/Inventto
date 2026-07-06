import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { movementFactory } from '../../../tests/factories/movement.factory';

import { MovementDetails } from '.';

vi.mock('@/features/permissions', () => ({
  VisibleTo: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('MovementDetails', () => {
  it('should render the formatted executedAt date', () => {
    const movement = movementFactory.build({
      executedAt: new Date('2024-03-15T10:30:00'),
      reason: 'Compra',
      description: undefined
    });

    render(<MovementDetails movement={movement} />);

    expect(screen.getByText('15/03/2024 · 10:30')).toBeInTheDocument();
  });

  it('should show the description when reason is "Outro" and description is set', () => {
    const movement = movementFactory.build({
      reason: 'Outro',
      description: 'Ajuste manual de estoque'
    });

    render(<MovementDetails movement={movement} />);

    expect(screen.getByText('“Ajuste manual de estoque”')).toBeInTheDocument();
  });

  it('should not show the description block when reason is not "Outro"', () => {
    const movement = movementFactory.build({
      reason: 'Compra',
      description: 'Texto que não deveria aparecer'
    });

    render(<MovementDetails movement={movement} />);

    expect(
      screen.queryByText('“Texto que não deveria aparecer”')
    ).not.toBeInTheDocument();
  });
});
