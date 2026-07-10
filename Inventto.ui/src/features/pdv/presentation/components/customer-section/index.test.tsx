import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { pdvCustomerFactory } from '../../../tests/factories/pdv-customer.factory';

import { CustomerSection } from './index';

const { mockUseLookupCustomerQuery } = vi.hoisted(() => ({
  mockUseLookupCustomerQuery: vi.fn()
}));

vi.mock('../../hooks/use-queries', () => ({
  useLookupCustomerQuery: mockUseLookupCustomerQuery
}));

// Bypassa o debounce real para o teste ser determinístico.
vi.mock('@/shared/hooks/use-debounced-value', () => ({
  useDebouncedValue: (value: string) => value
}));

describe('CustomerSection', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLookupCustomerQuery.mockReturnValue({
      data: undefined,
      isLoading: false
    });
  });

  it('should show the optional helper and no customer card by default', () => {
    render(<CustomerSection onChange={vi.fn()} />);

    expect(
      screen.getByText('Opcional — para registrar no histórico do cliente.')
    ).toBeInTheDocument();
    expect(screen.queryByText(/cliente desde/)).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('Nome do cliente')
    ).not.toBeInTheDocument();
  });

  it('should call onChange(null) when the phone is cleared', async () => {
    const onChange = vi.fn();
    render(<CustomerSection onChange={onChange} />);

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('should show the found-customer card and call onChange with the phone only', async () => {
    const customer = pdvCustomerFactory.build({
      name: 'Maria Souza',
      since: new Date('2024-03-15T00:00:00.000Z')
    });
    mockUseLookupCustomerQuery.mockReturnValue({
      data: customer,
      isLoading: false
    });
    const onChange = vi.fn();

    render(<CustomerSection onChange={onChange} />);

    await user.type(
      screen.getByLabelText('Telefone do cliente'),
      '11999998888'
    );

    expect(screen.getByText('Maria Souza')).toBeInTheDocument();
    expect(screen.getByText(/cliente desde/)).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('Nome do cliente')
    ).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith({ phone: '11999998888' });
  });

  it('should show the new-customer name field and helper when no customer matches', async () => {
    mockUseLookupCustomerQuery.mockReturnValue({
      data: null,
      isLoading: false
    });
    const onChange = vi.fn();

    render(<CustomerSection onChange={onChange} />);

    await user.type(
      screen.getByLabelText('Telefone do cliente'),
      '11999998888'
    );

    expect(screen.getByPlaceholderText('Nome do cliente')).toBeInTheDocument();
    expect(
      screen.getByText('Cliente novo — será criado ao confirmar a venda.')
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText('Nome'), 'Novo Cliente');

    expect(onChange).toHaveBeenLastCalledWith({
      phone: '11999998888',
      name: 'Novo Cliente'
    });
  });

  it('should not show the found card or the new-customer field while the lookup is loading', async () => {
    mockUseLookupCustomerQuery.mockReturnValue({
      data: undefined,
      isLoading: true
    });

    render(<CustomerSection onChange={vi.fn()} />);

    await user.type(
      screen.getByLabelText('Telefone do cliente'),
      '11999998888'
    );

    expect(screen.queryByText(/cliente desde/)).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('Nome do cliente')
    ).not.toBeInTheDocument();
  });
});
