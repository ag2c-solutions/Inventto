import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  movementFactory,
  movementItemFactory
} from '../../../../../../../tests/factories/movement.factory';

import { MovementCard } from '.';

vi.mock('@/features/permissions', () => ({
  VisibleTo: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('MovementCard', () => {
  const user = userEvent.setup();

  it('should render the entry badge and formatted date', () => {
    const movement = movementFactory.build({
      type: 'entry',
      reason: 'Compra',
      executedAt: new Date(2024, 2, 15, 10, 30)
    });

    render(<MovementCard movement={movement} />);

    expect(screen.getByText('Entrada')).toBeInTheDocument();
    expect(screen.getByText('Compra')).toBeInTheDocument();
    expect(screen.getByText('15/03/2024 · 10:30')).toBeInTheDocument();
  });

  it('should render the withdrawal badge', () => {
    const movement = movementFactory.build({ type: 'withdrawal' });

    render(<MovementCard movement={movement} />);

    expect(screen.getByText('Saída')).toBeInTheDocument();
  });

  it('should show "Sistema" when there is no responsible user', () => {
    const movement = movementFactory.build({ user: undefined });

    render(<MovementCard movement={movement} />);

    expect(screen.getByText('Sistema')).toBeInTheDocument();
  });

  it('should show the responsible user full name', () => {
    const movement = movementFactory.build({
      user: { fullName: 'Joana Ribeiro' }
    });

    render(<MovementCard movement={movement} />);

    expect(screen.getByText('Joana Ribeiro')).toBeInTheDocument();
  });

  it('should show the document number when present', () => {
    const movement = movementFactory.build({ documentNumber: 'NF-00123' });

    render(<MovementCard movement={movement} />);

    expect(screen.getByText('NF-00123')).toBeInTheDocument();
  });

  it('should expand to show the item list when clicked', async () => {
    const movement = movementFactory.build({
      items: [movementItemFactory.build({ product: { name: 'Camisa Social' } })]
    });

    render(<MovementCard movement={movement} />);

    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Camisa Social')).not.toBeInTheDocument();

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Camisa Social')).toBeInTheDocument();
  });

  it('should show the description quote when reason is "Outro" and expanded', async () => {
    const movement = movementFactory.build({
      reason: 'Outro',
      description: 'Ajuste manual'
    });

    render(<MovementCard movement={movement} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('“Ajuste manual”')).toBeInTheDocument();
  });
});
