import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUsePermission = vi.fn();
const mockMutate = vi.fn();
const mockUseDeactivate = vi.fn();

vi.mock('@/features/permissions/presentation/hooks/use-permissions', () => ({
  usePermission: () => mockUsePermission()
}));

vi.mock('@/features/users', () => ({
  useUser: () => ({
    currentOrganization: { id: 'org-1', name: 'Ateliê Joana' }
  })
}));

vi.mock('../../hooks/use-mutations', () => ({
  useDeactivateOrganizationMutation: () => mockUseDeactivate()
}));

import { DeactivateOrganizationDialog } from './index';

describe('DeactivateOrganizationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePermission.mockReturnValue({
      can: vi.fn(() => true),
      isLoading: false
    });
    mockUseDeactivate.mockReturnValue({ mutate: mockMutate, isPending: false });
  });

  const openDialog = () => {
    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }));
  };

  it('exibe título com o nome da organização, lead, consequências e nota', () => {
    render(<DeactivateOrganizationDialog />);
    openDialog();

    expect(
      screen.getByRole('dialog', { name: 'Desativar Ateliê Joana?' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('A operação fica pausada — mas nada é perdido.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Os catálogos e vitrines saem do ar.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Gerentes e Vendedores perdem o acesso.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Pedidos pendentes são cancelados e o estoque, liberado.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Você pode reativar quando quiser.')
    ).toBeInTheDocument();
  });

  it('dispara a mutation ao confirmar "Desativar"', () => {
    render(<DeactivateOrganizationDialog />);
    openDialog();

    const confirm = screen
      .getAllByRole('button', { name: 'Desativar' })
      .at(-1)!;
    fireEvent.click(confirm);

    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  it('bloqueia o botão e mostra "Desativando…" durante a execução', () => {
    mockUseDeactivate.mockReturnValue({ mutate: mockMutate, isPending: true });

    render(<DeactivateOrganizationDialog />);
    openDialog();

    expect(screen.getByText('Desativando…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Desativando…' })).toBeDisabled();
  });

  it('fecha sem ação ao clicar em "Cancelar"', () => {
    render(<DeactivateOrganizationDialog />);
    openDialog();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('não renderiza o gatilho sem permissão (RN020)', () => {
    mockUsePermission.mockReturnValue({
      can: vi.fn(() => false),
      isLoading: false
    });

    render(<DeactivateOrganizationDialog />);

    expect(screen.queryByRole('button', { name: 'Desativar' })).toBeNull();
  });
});
