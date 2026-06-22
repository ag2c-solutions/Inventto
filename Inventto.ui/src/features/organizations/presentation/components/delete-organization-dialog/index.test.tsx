import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUsePermission = vi.fn();

vi.mock('@/features/permissions/presentation/hooks/use-permissions', () => ({
  usePermission: () => mockUsePermission()
}));

import { DeleteOrganizationDialog } from './index';

describe('DeleteOrganizationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePermission.mockReturnValue({
      can: vi.fn(() => true),
      isLoading: false
    });
  });

  it('abre o modal de exclusão ao clicar no gatilho', () => {
    render(<DeleteOrganizationDialog />);

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(
      screen.getByRole('dialog', { name: 'Excluir organização' })
    ).toBeInTheDocument();
  });

  it('não renderiza o gatilho sem permissão (RN020)', () => {
    mockUsePermission.mockReturnValue({
      can: vi.fn(() => false),
      isLoading: false
    });

    render(<DeleteOrganizationDialog />);

    expect(screen.queryByRole('button', { name: 'Excluir' })).toBeNull();
  });
});
