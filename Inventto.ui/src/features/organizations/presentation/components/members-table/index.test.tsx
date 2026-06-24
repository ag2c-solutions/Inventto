import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

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
  AddMember: () => <button>Adicionar Membro</button>
}));

import { MembersListTable } from './index';

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
    name: 'Carla Mendes',
    email: 'carla.m@email.com',
    role: 'sales',
    status: 'invited',
    joinedAt: new Date(),
    isMe: false
  },
  {
    id: '4',
    profileId: 'p4',
    organizationId: 'org',
    name: 'Pedro Alves',
    email: 'pedro.alves@email.com',
    role: 'manager',
    status: 'inactive',
    joinedAt: new Date(),
    isMe: false
  }
];

describe('MembersListTable', () => {
  const user = userEvent.setup();

  // Radix Select usa Pointer Capture, ausente no jsdom.
  beforeAll(() => {
    Element.prototype.hasPointerCapture = vi.fn();
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ isLoading: false });
    mockUseMembersQuery.mockReturnValue({ data: members, isLoading: false });
  });

  it('renderiza cabeçalho da tabela com colunas Membro, Função e Status', () => {
    render(<MembersListTable />);

    const headers = screen.getAllByRole('columnheader');
    expect(headers.map((h) => h.textContent)).toEqual([
      'Membro',
      'Função',
      'Status'
    ]);
    headers.forEach((h) => expect(h).toHaveAttribute('scope', 'col'));
  });

  it('marca o Owner logado com "(Você)"', () => {
    render(<MembersListTable />);

    const ownerRow = screen.getByText('Joana Ribeiro').closest('tr')!;
    expect(within(ownerRow).getByText('(Você)')).toBeInTheDocument();
  });

  it('usa o rótulo "Convidado" (não "Pendente") para membros convidados', () => {
    render(<MembersListTable />);

    expect(screen.getByText('Convidado')).toBeInTheDocument();
    expect(screen.queryByText('Pendente')).not.toBeInTheDocument();
  });

  it('esmaece a linha do membro inativo e mostra avatar muted', () => {
    render(<MembersListTable />);

    const inactiveRow = screen.getByText('Pedro Alves').closest('tr')!;
    expect(inactiveRow.className).toContain('opacity-60');

    const inactiveAvatar = within(inactiveRow).getByText('PE');
    expect(inactiveAvatar.className).toContain('text-muted-foreground');
  });

  it('oferece o filtro de status com a opção "Convidado" e sem "Pendente"', async () => {
    render(<MembersListTable />);

    const statusTrigger = screen
      .getByText('Todos os status')
      .closest('button')!;
    await user.click(statusTrigger);

    const listbox = await screen.findByRole('listbox');
    expect(within(listbox).getByText('Convidado')).toBeInTheDocument();
    expect(within(listbox).queryByText('Pendente')).not.toBeInTheDocument();
  });

  it('mostra mensagem inline com o termo quando a busca não retorna resultados', async () => {
    render(<MembersListTable />);

    await user.type(
      screen.getByPlaceholderText('Buscar membros por nome ou e-mail'),
      'joaquim'
    );

    expect(
      await screen.findByText('Nenhum membro encontrado para "joaquim".')
    ).toBeInTheDocument();
  });

  it('exibe o skeleton enquanto a organização ou os membros carregam', () => {
    mockUseMembersQuery.mockReturnValue({ data: [], isLoading: true });

    const { container } = render(<MembersListTable />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(0);
    expect(screen.queryByText('Membro')).not.toBeInTheDocument();
  });
});
