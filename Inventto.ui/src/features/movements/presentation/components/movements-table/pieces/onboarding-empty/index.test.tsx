import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MovementsOnboardingEmpty } from '.';

const { mockCan } = vi.hoisted(() => ({ mockCan: vi.fn() }));

vi.mock('@/features/permissions', () => ({
  usePermission: () => ({ can: mockCan, role: 'manager', isLoading: false })
}));

vi.mock('../../../add-moviment', () => ({
  AddNewMovements: () => <button type="button">Registrar</button>
}));

describe('MovementsOnboardingEmpty', () => {
  it('should render the empty state message and instruct registering stock when the user can create movements', () => {
    mockCan.mockReturnValue(true);

    render(<MovementsOnboardingEmpty />);

    expect(screen.getByText('Nenhuma movimentação ainda.')).toBeInTheDocument();
    expect(mockCan).toHaveBeenCalledWith('movement:create');
    expect(
      screen.getByText(/Comece adicionando estoque a um produto/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Registrar' })
    ).toBeInTheDocument();
  });

  it('MOV-08: should explain that movements come from sales when the user cannot register (Sales)', () => {
    mockCan.mockReturnValue(false);

    render(<MovementsOnboardingEmpty />);

    expect(
      screen.getByText(/aparecem aqui a partir das suas vendas/)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Comece adicionando estoque/)
    ).not.toBeInTheDocument();
  });
});
