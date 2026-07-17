import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { memberFactory } from '../../../../tests/factories/member.factory';

const { mockUseUpdateMemberRoleMutation } = vi.hoisted(() => ({
  mockUseUpdateMemberRoleMutation: vi.fn()
}));

vi.mock('../../../hooks/use-mutations', () => ({
  useUpdateMemberRoleMutation: mockUseUpdateMemberRoleMutation
}));

import { RoleColumn } from './role';

describe('RoleColumn', () => {
  const user = userEvent.setup();
  const mutateAsync = vi.fn();

  beforeAll(() => {
    Element.prototype.hasPointerCapture = vi.fn();
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUpdateMemberRoleMutation.mockReturnValue({
      mutateAsync,
      isPending: false
    });
  });

  it('exibe apenas o badge (sem select) para o próprio usuário', () => {
    const member = memberFactory.build({ isMe: true, role: 'manager' });

    render(<RoleColumn member={member} />);

    expect(screen.getByText('Gerente')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('exibe apenas o badge (sem select) para o Dono', () => {
    const member = memberFactory.build({ isMe: false, role: 'owner' });

    render(<RoleColumn member={member} />);

    expect(screen.getByText('Dono')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('desabilita o botão de alterar quando não há mudança de função', () => {
    const member = memberFactory.build({ isMe: false, role: 'sales' });

    render(<RoleColumn member={member} />);

    expect(
      screen.getByRole('button', { name: 'Alterar Função' })
    ).toBeDisabled();
  });

  it('habilita o botão e envia a nova função ao trocar a seleção (caminho feliz)', async () => {
    mutateAsync.mockResolvedValue(undefined);
    const member = memberFactory.build({
      id: 'member-1',
      isMe: false,
      role: 'sales'
    });

    render(<RoleColumn member={member} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Gerente' }));

    const submitButton = screen.getByRole('button', { name: 'Alterar Função' });
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

    expect(mutateAsync).toHaveBeenCalledWith({
      memberId: 'member-1',
      role: 'manager'
    });
  });

  it('reverte para a função original quando a mutation falha (caminho de falha)', async () => {
    mutateAsync.mockRejectedValue(new Error('Falha'));
    const member = memberFactory.build({
      id: 'member-1',
      isMe: false,
      role: 'sales'
    });

    render(<RoleColumn member={member} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Gerente' }));
    await user.click(screen.getByRole('button', { name: 'Alterar Função' }));

    expect(
      await screen.findByRole('button', { name: 'Alterar Função' })
    ).toBeDisabled();
  });
});
