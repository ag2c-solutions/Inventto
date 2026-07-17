import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { OrderMicroState } from '../../../domain/entities';

import { OrderCardBadge } from './index';

describe('OrderCardBadge', () => {
  it.each([
    ['pending', 'Pendente'],
    ['confirming', 'Confirmando'],
    ['picking', 'Em separação'],
    ['delivering', 'Em entrega'],
    ['confirmed', 'Finalizado'],
    ['cancelled', 'Cancelado'],
    ['expired', 'Expirado']
  ] as [OrderMicroState, string][])(
    'should render the label for micro-state "%s"',
    (microState, label) => {
      render(<OrderCardBadge microState={microState} />);

      expect(screen.getByText(label)).toBeInTheDocument();
    }
  );

  it('should render cancelled as a solid badge (inativo sólido)', () => {
    const { container } = render(<OrderCardBadge microState="cancelled" />);

    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge?.className).toContain('bg-foreground');
  });

  it('should render expired as an outline badge (inativo contorno)', () => {
    const { container } = render(<OrderCardBadge microState="expired" />);

    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge?.className).toContain('bg-transparent');
    expect(badge?.className).not.toContain('bg-foreground');
  });
});
