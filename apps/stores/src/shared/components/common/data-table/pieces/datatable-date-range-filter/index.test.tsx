import type { Table } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DataTableContext } from '../../hook/use-data-table';

import { DataTableDateRangeFilter } from './index';

function buildTable(filterValue: unknown, setFilterValue = vi.fn()) {
  const column = { getFilterValue: () => filterValue, setFilterValue };

  return {
    getColumn: () => column
  } as unknown as Table<unknown>;
}

const renderWithTable = (table: Table<unknown>) =>
  render(
    <DataTableContext.Provider value={{ table }}>
      <DataTableDateRangeFilter column="createdAt" />
    </DataTableContext.Provider>
  );

describe('DataTableDateRangeFilter', () => {
  it('should render the placeholder title when no filter is applied', () => {
    renderWithTable(buildTable(undefined));

    expect(screen.getByText('Selecione uma data')).toBeInTheDocument();
  });

  it('should list the period shortcuts and an "Aplicar" button when opened', async () => {
    const user = userEvent.setup();
    renderWithTable(buildTable(undefined));

    await user.click(
      screen.getByRole('button', { name: /selecione uma data/i })
    );

    expect(screen.getByRole('button', { name: 'Hoje' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Últimos 7 dias' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Últimos 30 dias' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Últimos 60 dias' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Últimos 90 dias' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Personalizado' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aplicar' })).toBeInTheDocument();
  });

  it('should only commit the filter once "Aplicar" is clicked, not on preset click', async () => {
    const setFilterValue = vi.fn();
    const user = userEvent.setup();
    renderWithTable(buildTable(undefined, setFilterValue));

    await user.click(
      screen.getByRole('button', { name: /selecione uma data/i })
    );
    await user.click(screen.getByRole('button', { name: 'Últimos 7 dias' }));

    expect(setFilterValue).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(setFilterValue).toHaveBeenCalledTimes(1);
    const [range] = setFilterValue.mock.calls[0];
    expect(range.from).toBeInstanceOf(Date);
    expect(range.to).toBeInstanceOf(Date);
    expect(range.from.getTime()).toBeLessThan(range.to.getTime());
  });

  it('should render the applied range formatted in the trigger', () => {
    renderWithTable(
      buildTable({
        from: new Date('2026-05-02T00:00:00'),
        to: new Date('2026-05-31T00:00:00')
      })
    );

    expect(screen.getByText('02/05/2026 – 31/05/2026')).toBeInTheDocument();
  });
});
