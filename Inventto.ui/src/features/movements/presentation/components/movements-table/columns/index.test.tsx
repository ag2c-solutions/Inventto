import type { Column, Row } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Movement } from '../../../../domain/entities';
import { movementFactory } from '../../../../tests/factories/movement.factory';

import { columnsMovementsListTable } from '.';

vi.mock('@/features/permissions', () => ({
  ActionButton: ({
    action: _action,
    children,
    onClick,
    ...props
  }: React.ComponentProps<'button'> & { action: string }) => (
    <button {...props} onClick={onClick}>
      {children}
    </button>
  ),
  VisibleTo: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

function makeRow(
  movement: Movement,
  overrides: Partial<Row<Movement>> = {}
): Row<Movement> {
  return {
    original: movement,
    toggleExpanded: vi.fn(),
    getIsExpanded: () => false,
    ...overrides
  } as unknown as Row<Movement>;
}

function getColumn(id: string) {
  const column = columnsMovementsListTable.find(
    (c) => c.id === id || (c as { accessorKey?: string }).accessorKey === id
  );
  if (!column) throw new Error(`Column ${id} not found`);
  return column;
}

function renderCell(id: string, row: Row<Movement>) {
  const column = getColumn(id);
  const cell = column.cell as (context: {
    row: Row<Movement>;
  }) => React.ReactNode;
  return render(<>{cell({ row })}</>);
}

describe('columnsMovementsListTable', () => {
  it('actions: should render a toggle button when the movement has items and call toggleExpanded on click', async () => {
    const user = userEvent.setup();
    const toggleExpanded = vi.fn();
    const movement = movementFactory.build();
    const row = makeRow(movement, { toggleExpanded });

    renderCell('actions', row);

    await user.click(screen.getByRole('button'));

    expect(toggleExpanded).toHaveBeenCalledTimes(1);
  });

  it('actions: should render nothing when the movement has no items', () => {
    const movement = movementFactory.build({ items: [] });
    const row = makeRow(movement);

    const { container } = renderCell('actions', row);

    expect(container.querySelector('button')).not.toBeInTheDocument();
  });

  it('createdAt: should render the executedAt date and time', () => {
    const movement = movementFactory.build({
      executedAt: new Date(2024, 2, 15, 10, 30)
    });
    const row = makeRow(movement);

    renderCell('createdAt', row);

    expect(screen.getByText('15/03/2024')).toBeInTheDocument();
    expect(screen.getByText('10:30')).toBeInTheDocument();
  });

  it('type: should render "Entrada" for entry movements', () => {
    const movement = movementFactory.build({ type: 'entry' });
    const row = makeRow(movement);

    renderCell('type', row);

    expect(screen.getByText('Entrada')).toBeInTheDocument();
  });

  it('type: should render "Saída" for withdrawal movements', () => {
    const movement = movementFactory.build({ type: 'withdrawal' });
    const row = makeRow(movement);

    renderCell('type', row);

    expect(screen.getByText('Saída')).toBeInTheDocument();
  });

  it('reason: should show the document number when present', () => {
    const movement = movementFactory.build({ documentNumber: 'NF-001' });
    const row = makeRow(movement);

    renderCell('reason', row);

    expect(screen.getByText('NF-001')).toBeInTheDocument();
  });

  it('reason: should show a placeholder when there is no document number', () => {
    const movement = movementFactory.build({ documentNumber: undefined });
    const row = makeRow(movement);

    renderCell('reason', row);

    expect(screen.getByText('Sem documento')).toBeInTheDocument();
  });

  it('user: should show "Sistema" when there is no responsible user', () => {
    const movement = movementFactory.build({ user: undefined });
    const row = makeRow(movement);

    renderCell('user', row);

    expect(screen.getByText('Sistema')).toBeInTheDocument();
  });

  it('user: should show the responsible user full name', () => {
    const movement = movementFactory.build({
      user: { fullName: 'Joana Ribeiro' }
    });
    const row = makeRow(movement);

    renderCell('user', row);

    expect(screen.getByText('Joana Ribeiro')).toBeInTheDocument();
  });

  it('totalQuantity: should render the item count', () => {
    const movement = movementFactory.build({
      type: 'entry',
      totalQuantity: 5,
      items: movementFactory.build().items
    });
    const row = makeRow(movement);

    renderCell('totalQuantity', row);

    expect(screen.getByText('+5')).toBeInTheDocument();
  });

  it('totalValue: should render the formatted currency value', () => {
    const movement = movementFactory.build({ totalValue: 150 });
    const row = makeRow(movement);

    renderCell('totalValue', row);

    expect(screen.getByText('R$ 150,00')).toBeInTheDocument();
  });

  it('totalValue header: should render the "Valor" label', () => {
    const column = getColumn('totalValue');
    const header = column.header as (context: {
      column: Column<Movement, unknown>;
    }) => React.ReactNode;

    render(<>{header({ column: {} as Column<Movement, unknown> })}</>);

    expect(screen.getByText('Valor')).toBeInTheDocument();
  });
});
