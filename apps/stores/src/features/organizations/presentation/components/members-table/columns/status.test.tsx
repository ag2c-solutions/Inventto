import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { memberFactory } from '../../../../tests/factories/member.factory';

const { mockUseUpdateMemberStatusMutation } = vi.hoisted(() => ({
  mockUseUpdateMemberStatusMutation: vi.fn()
}));

vi.mock('../../../hooks/use-mutations', () => ({
  useUpdateMemberStatusMutation: mockUseUpdateMemberStatusMutation
}));

import { StatusColumn } from './status';

describe('StatusColumn', () => {
  const user = userEvent.setup();
  const mutateAsync = vi.fn();

  beforeAll(() => {
    Element.prototype.hasPointerCapture = vi.fn();
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUpdateMemberStatusMutation.mockReturnValue({
      mutateAsync,
      isPending: false
    });
  });

  it('exibe apenas o badge para o próprio usuário', () => {
    const member = memberFactory.build({ isMe: true, status: 'active' });

    render(<StatusColumn member={member} />);

    expect(screen.getByText('Ativo')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('exibe apenas o badge para o Dono', () => {
    const member = memberFactory.build({
      isMe: false,
      role: 'owner',
      status: 'active'
    });

    render(<StatusColumn member={member} />);

    expect(screen.getByText('Ativo')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('exibe "aguardando 1º acesso" para membros convidados', () => {
    const member = memberFactory.build({
      isMe: false,
      role: 'sales',
      status: 'invited'
    });

    render(<StatusColumn member={member} />);

    expect(screen.getByText('Convidado')).toBeInTheDocument();
    expect(screen.getByText('aguardando 1º acesso')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('desabilita o botão de alterar quando não há mudança de status', () => {
    const member = memberFactory.build({
      isMe: false,
      role: 'sales',
      status: 'active'
    });

    render(<StatusColumn member={member} />);

    expect(
      screen.getByRole('button', { name: 'Alterar Status' })
    ).toBeDisabled();
  });

  it('habilita o botão e envia o novo status ao trocar a seleção (caminho feliz)', async () => {
    mutateAsync.mockResolvedValue(undefined);
    const member = memberFactory.build({
      id: 'member-1',
      isMe: false,
      role: 'sales',
      status: 'active'
    });

    render(<StatusColumn member={member} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Inativo' }));

    const submitButton = screen.getByRole('button', { name: 'Alterar Status' });
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

    expect(mutateAsync).toHaveBeenCalledWith({
      memberId: 'member-1',
      status: 'inactive'
    });
  });

  it('reverte para o status original quando a mutation falha (caminho de falha)', async () => {
    mutateAsync.mockRejectedValue(new Error('Falha'));
    const member = memberFactory.build({
      id: 'member-1',
      isMe: false,
      role: 'sales',
      status: 'active'
    });

    render(<StatusColumn member={member} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Inativo' }));
    await user.click(screen.getByRole('button', { name: 'Alterar Status' }));

    expect(
      await screen.findByRole('button', { name: 'Alterar Status' })
    ).toBeDisabled();
  });
});
