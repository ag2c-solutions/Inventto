import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IMember } from '../../../domain/entities';

const { mockUseUser, mockUseMembersQuery } = vi.hoisted(() => ({
  mockUseUser: vi.fn(),
  mockUseMembersQuery: vi.fn()
}));

vi.mock('@/features/users', () => ({
  useUser: mockUseUser
}));

vi.mock('../../hooks/use-queries', () => ({
  useOrganizationMembersQuery: mockUseMembersQuery
}));

vi.mock('../../hooks/use-mutations', () => ({
  useUpdateMemberRoleMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false
  }),
  useUpdateMemberStatusMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false
  })
}));

vi.mock('../add-member', () => ({
  AddMember: ({ iconOnly }: { iconOnly?: boolean }) => (
    <button aria-label="Adicionar Membro">
      {iconOnly ? null : 'Adicionar Membro'}
    </button>
  )
}));

import { MembersCardList } from '.';

const members: IMember[] = [
  {
    id: '1',
    profileId: 'p1',
    organizationId: 'org',
    name: 'Joana Ribeiro',
    email: 'joana@email.com',
    role: 'owner',
    status: 'active',
    joinedAt: new Date(),
    isMe: true
  },
  {
    id: '2',
    profileId: 'p2',
    organizationId: 'org',
    name: 'Marcos Lima',
    email: 'marcos.lima@email.com',
    role: 'manager',
    status: 'active',
    joinedAt: new Date(),
    isMe: false
  },
  {
    id: '3',
    profileId: 'p3',
    organizationId: 'org',
    name: 'Pedro Alves',
    email: 'pedro.alves@email.com',
    role: 'manager',
    status: 'inactive',
    joinedAt: new Date(),
    isMe: false
  }
];

describe('MembersCardList', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ isLoading: false });
    mockUseMembersQuery.mockReturnValue({ data: members, isLoading: false });
  });

  it('renderiza um cartão por membro (sem tabela)', () => {
    render(<MembersCardList />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('Joana Ribeiro')).toBeInTheDocument();
    expect(screen.getByText('Marcos Lima')).toBeInTheDocument();
    expect(
      screen.getByText('Toque num membro para alterar função ou status.')
    ).toBeInTheDocument();
  });

  it('mostra o Owner apenas com badges (sem controles de edição)', () => {
    render(<MembersCardList />);

    const ownerCard = screen
      .getByText('Joana Ribeiro')
      .closest('div.rounded-lg') as HTMLElement;

    expect(within(ownerCard).queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('esmaece o cartão do membro inativo', () => {
    render(<MembersCardList />);

    const inactiveCard = screen
      .getByText('Pedro Alves')
      .closest('div.rounded-lg') as HTMLElement;
    expect(inactiveCard.className).toContain('opacity-60');
  });

  it('renderiza o CTA "Adicionar Membro" como botão-ícone', () => {
    render(<MembersCardList />);

    const cta = screen.getByRole('button', { name: 'Adicionar Membro' });
    expect(cta).toHaveTextContent('');
  });

  it('filtra os cartões pela busca de nome ou e-mail', async () => {
    render(<MembersCardList />);

    await user.type(
      screen.getByPlaceholderText('Buscar por nome ou e-mail'),
      'marcos'
    );

    expect(screen.getByText('Marcos Lima')).toBeInTheDocument();
    expect(screen.queryByText('Joana Ribeiro')).not.toBeInTheDocument();
  });

  it('mostra mensagem com o termo quando a busca não retorna resultados', async () => {
    render(<MembersCardList />);

    await user.type(
      screen.getByPlaceholderText('Buscar por nome ou e-mail'),
      'joaquim'
    );

    expect(
      screen.getByText('Nenhum membro encontrado para "joaquim".')
    ).toBeInTheDocument();
  });

  it('exibe o skeleton enquanto os membros carregam', () => {
    mockUseMembersQuery.mockReturnValue({ data: [], isLoading: true });

    const { container } = render(<MembersCardList />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(0);
    expect(screen.queryByText('Joana Ribeiro')).not.toBeInTheDocument();
  });
});
