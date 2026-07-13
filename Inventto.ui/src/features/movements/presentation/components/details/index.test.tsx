import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { movementFactory } from '../../../tests/factories/movement.factory';

import { MovementDetails } from '.';

vi.mock('@/features/permissions', () => ({
  VisibleTo: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ActionButton: ({
    action: _action,
    children,
    ...props
  }: React.ComponentProps<'button'> & { action: string }) => (
    <button {...props}>{children}</button>
  )
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('MovementDetails', () => {
  it('should render the formatted executedAt date', () => {
    const movement = movementFactory.build({
      executedAt: new Date('2024-03-15T10:30:00'),
      reason: 'Compra',
      description: undefined
    });

    renderWithProviders(<MovementDetails movement={movement} />);

    expect(screen.getByText('15/03/2024 · 10:30')).toBeInTheDocument();
  });

  it('should show the description when reason is "Outro" and description is set', () => {
    const movement = movementFactory.build({
      reason: 'Outro',
      description: 'Ajuste manual de estoque'
    });

    renderWithProviders(<MovementDetails movement={movement} />);

    expect(screen.getByText('“Ajuste manual de estoque”')).toBeInTheDocument();
  });

  it('should not show the description block when reason is not "Outro"', () => {
    const movement = movementFactory.build({
      reason: 'Compra',
      description: 'Texto que não deveria aparecer'
    });

    renderWithProviders(<MovementDetails movement={movement} />);

    expect(
      screen.queryByText('“Texto que não deveria aparecer”')
    ).not.toBeInTheDocument();
  });

  it('should show the "Estornar venda" action for a confirmed sale linked to an order', () => {
    const movement = movementFactory.build({
      reason: 'Venda',
      orderId: 'order-1',
      orderStatus: 'confirmed'
    });

    renderWithProviders(<MovementDetails movement={movement} />);

    expect(
      screen.getByRole('button', { name: /Estornar venda/ })
    ).toBeInTheDocument();
  });

  it('should not show the "Estornar venda" action for a non-sale movement', () => {
    const movement = movementFactory.build({ reason: 'Compra' });

    renderWithProviders(<MovementDetails movement={movement} />);

    expect(
      screen.queryByRole('button', { name: /Estornar venda/ })
    ).not.toBeInTheDocument();
  });
});
