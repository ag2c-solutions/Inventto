import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUsePermission = vi.fn();
vi.mock('@/features/permissions/presentation/hooks/use-permissions', () => ({
  usePermission: () => mockUsePermission()
}));

const mockUseIsMobile = vi.fn();
vi.mock('@/shared/hooks/use-is-mobile', () => ({
  useIsMobile: () => mockUseIsMobile()
}));

vi.mock('@/features/organizations/presentation/hooks/use-queries', () => ({
  useCandidatesQuery: () => ({ data: [] })
}));

vi.mock('@/features/organizations/presentation/hooks/use-mutations', () => ({
  useCreateMemberMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useReplicateMemberMutation: () => ({ mutateAsync: vi.fn(), isPending: false })
}));

vi.mock('../../forms/member', () => ({
  MemberForm: () => <div data-testid="member-form" />
}));

import { AddMember } from '.';

describe('AddMember', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePermission.mockReturnValue({
      can: vi.fn(() => true),
      isLoading: false
    });
    mockUseIsMobile.mockReturnValue(false);
  });

  it('abre o sheet com o formulário de membro ao clicar no gatilho', async () => {
    render(<AddMember />);

    await user.click(screen.getByRole('button', { name: 'Adicionar Membro' }));

    expect(
      screen.getByRole('heading', { name: 'Adicionar membro' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('member-form')).toBeInTheDocument();
  });

  it('exibe apenas o ícone quando iconOnly é true', () => {
    render(<AddMember iconOnly />);

    const trigger = screen.getByRole('button', { name: 'Adicionar Membro' });
    expect(trigger).not.toHaveTextContent('Adicionar Membro');
  });

  it('não renderiza o gatilho sem permissão de team:manage', () => {
    mockUsePermission.mockReturnValue({
      can: vi.fn(() => false),
      isLoading: false
    });

    render(<AddMember />);

    expect(
      screen.queryByRole('button', { name: 'Adicionar Membro' })
    ).not.toBeInTheDocument();
  });
});
