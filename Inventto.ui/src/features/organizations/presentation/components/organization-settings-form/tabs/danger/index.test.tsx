import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUsePermission = vi.fn();

vi.mock('@/features/permissions/presentation/hooks/use-permissions', () => ({
  usePermission: () => mockUsePermission()
}));

import { DangerZoneTabContent } from './index';

describe('DangerZoneTabContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePermission.mockReturnValue({
      can: vi.fn(() => true),
      isLoading: false
    });
  });

  it('renderiza a região com o rótulo de acessibilidade e os dois blocos', () => {
    render(<DangerZoneTabContent />);

    const region = screen.getByRole('region', { name: 'Zona de risco' });
    expect(region).toBeInTheDocument();

    expect(
      screen.getByText(
        'Ações sensíveis que afetam a operação inteira desta organização.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Desativar organização')).toBeInTheDocument();
    expect(
      screen.getByText(/Pausa as vendas e tira as vitrines do ar/)
    ).toBeInTheDocument();
    expect(screen.getByText('Excluir organização')).toBeInTheDocument();
    expect(
      screen.getByText(/Encerra permanentemente esta unidade/)
    ).toBeInTheDocument();
  });

  it('abre o modal de desativação ao clicar em "Desativar"', () => {
    render(<DangerZoneTabContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }));

    expect(
      screen.getByRole('dialog', { name: 'Desativar organização' })
    ).toBeInTheDocument();
  });

  it('abre o modal de exclusão ao clicar em "Excluir"', () => {
    render(<DangerZoneTabContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(
      screen.getByRole('dialog', { name: 'Excluir organização' })
    ).toBeInTheDocument();
  });

  it('não renderiza os gatilhos quando o usuário não tem permissão (RN020)', () => {
    mockUsePermission.mockReturnValue({
      can: vi.fn(() => false),
      isLoading: false
    });

    render(<DangerZoneTabContent />);

    expect(screen.queryByRole('button', { name: 'Desativar' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Excluir' })).toBeNull();
  });
});
