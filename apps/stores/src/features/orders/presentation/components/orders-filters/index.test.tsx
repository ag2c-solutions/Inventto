import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrdersFilters } from './index';

const { mockUsePermission } = vi.hoisted(() => ({
  mockUsePermission: vi.fn()
}));

vi.mock('@/features/permissions', () => ({
  usePermission: mockUsePermission
}));

const sellers = [
  { profileId: 'seller-1', name: 'Joana Ateliê' },
  { profileId: 'seller-2', name: 'Marcos Reis' }
] as never;

describe('OrdersFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.hasPointerCapture = vi.fn();
    window.HTMLElement.prototype.releasePointerCapture = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('should show the period + seller selects for Owner/Manager (order:view_all)', () => {
    mockUsePermission.mockReturnValue({ can: () => true });

    render(<OrdersFilters filters={{}} onChange={vi.fn()} sellers={sellers} />);

    expect(screen.getAllByRole('combobox')).toHaveLength(2);
  });

  it('should hide the seller select for Sales (no order:view_all)', () => {
    mockUsePermission.mockReturnValue({ can: () => false });

    render(<OrdersFilters filters={{}} onChange={vi.fn()} sellers={sellers} />);

    expect(screen.getAllByRole('combobox')).toHaveLength(1);
  });

  it('should always show the search input', () => {
    mockUsePermission.mockReturnValue({ can: () => false });

    render(<OrdersFilters filters={{}} onChange={vi.fn()} sellers={sellers} />);

    expect(
      screen.getByPlaceholderText('Buscar por nome ou telefone do cliente')
    ).toBeInTheDocument();
  });

  it('should call onChange when typing in the search input', () => {
    mockUsePermission.mockReturnValue({ can: () => false });
    const onChange = vi.fn();

    render(
      <OrdersFilters filters={{}} onChange={onChange} sellers={sellers} />
    );

    const input = screen.getByPlaceholderText(
      'Buscar por nome ou telefone do cliente'
    );
    fireEvent.change(input, { target: { value: 'joana' } });

    expect(onChange).toHaveBeenCalledWith({ search: 'joana' });
  });
});
