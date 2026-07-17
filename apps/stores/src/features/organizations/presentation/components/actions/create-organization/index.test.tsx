import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUsePermission = vi.fn();

vi.mock('@/features/permissions/presentation/hooks/use-permissions', () => ({
  usePermission: () => mockUsePermission()
}));

const mockUseUser = vi.fn();
vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

vi.mock('../../forms/create-organization', () => ({
  CreateOrgForm: ({ onSuccess }: { onSuccess?: () => void }) => (
    <button onClick={onSuccess}>simular sucesso</button>
  )
}));

import { CreateOrganizationDialog } from '.';

describe('CreateOrganizationDialog', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePermission.mockReturnValue({
      can: vi.fn(() => true),
      isLoading: false
    });
    mockUseUser.mockReturnValue({ availableOrganizations: [] });
  });

  it('abre o modal com o formulário ao clicar no gatilho', async () => {
    render(<CreateOrganizationDialog />);

    await user.click(screen.getByRole('button', { name: 'Criar organização' }));

    expect(
      screen.getByRole('dialog', { name: 'Nova organização' })
    ).toBeInTheDocument();
    expect(screen.getByText('simular sucesso')).toBeInTheDocument();
  });

  it('fecha o modal quando o form reporta sucesso', async () => {
    render(<CreateOrganizationDialog />);

    await user.click(screen.getByRole('button', { name: 'Criar organização' }));
    await user.click(screen.getByText('simular sucesso'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('não renderiza o gatilho sem permissão de org:create', () => {
    mockUsePermission.mockReturnValue({
      can: vi.fn(() => false),
      isLoading: false
    });

    render(<CreateOrganizationDialog />);

    expect(
      screen.queryByRole('button', { name: 'Criar organização' })
    ).not.toBeInTheDocument();
  });
});
