import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseCreateOrganizationMutation } = vi.hoisted(() => ({
  mockUseCreateOrganizationMutation: vi.fn()
}));

vi.mock('@/features/organizations/presentation/hooks/use-mutations', () => ({
  useCreateOrganizationMutation: mockUseCreateOrganizationMutation
}));

import { CreateOrgForm } from '.';

describe('CreateOrgForm', () => {
  const mockMutateAsync = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue('new-org-id');
    mockUseCreateOrganizationMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });
  });

  it('não exibe os campos de replicação sem outras organizações', () => {
    render(<CreateOrgForm otherOrganizations={[]} />);

    expect(
      screen.queryByText('Copiar configurações de outra unidade')
    ).not.toBeInTheDocument();
  });

  it('exibe erro de validação ao submeter com nome vazio (caminho de falha)', async () => {
    render(<CreateOrgForm otherOrganizations={[]} />);

    await user.click(screen.getByRole('button', { name: 'Criar organização' }));

    expect(
      await screen.findByText('O nome deve ter no mínimo 3 caracteres.')
    ).toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('submete com o payload correto e reseta o form (caminho feliz)', async () => {
    const onSuccess = vi.fn();
    render(<CreateOrgForm otherOrganizations={[]} onSuccess={onSuccess} />);

    await user.type(
      screen.getByPlaceholderText('Ex: Loja Shopping Norte'),
      'Loja Shopping Norte'
    );
    await user.click(screen.getByRole('button', { name: 'Criar organização' }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'Loja Shopping Norte',
        document: undefined,
        sourceOrgId: undefined,
        replicateGroups: undefined
      });
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('revela organização de origem e grupos de replicação ao ativar "Copiar configurações"', async () => {
    render(
      <CreateOrgForm
        otherOrganizations={[{ id: 'org-2', name: 'Filial Sul' } as never]}
      />
    );

    expect(
      screen.getByText('Copiar configurações de outra unidade')
    ).toBeInTheDocument();
    expect(screen.queryByText('Organização de origem')).not.toBeInTheDocument();

    await user.click(screen.getByRole('switch'));

    expect(screen.getByText('Organização de origem')).toBeInTheDocument();
    expect(screen.getByText('Categorias e atributos')).toBeInTheDocument();
  });

  it('chama onCancel ao clicar em Cancelar', async () => {
    const onCancel = vi.fn();
    render(<CreateOrgForm otherOrganizations={[]} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('desabilita os botões e mostra "Criando…" durante o envio', () => {
    mockUseCreateOrganizationMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true
    });

    render(<CreateOrgForm otherOrganizations={[]} />);

    expect(screen.getByText('Criando…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});
