import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseIsMobile = vi.fn();
vi.mock('@/shared/hooks/use-is-mobile', () => ({
  useIsMobile: () => mockUseIsMobile()
}));

vi.mock('../components/members-list', () => ({
  MembersCardList: () => <div data-testid="members-card-list" />
}));

vi.mock('../components/members-table', () => ({
  MembersListTable: () => <div data-testid="members-table" />
}));

import { MembersListPage } from './members-list';

describe('MembersListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza a lista em cartões no mobile', () => {
    mockUseIsMobile.mockReturnValue(true);

    render(<MembersListPage />);

    expect(screen.getByTestId('members-card-list')).toBeInTheDocument();
    expect(screen.queryByTestId('members-table')).not.toBeInTheDocument();
  });

  it('renderiza a tabela no desktop', () => {
    mockUseIsMobile.mockReturnValue(false);

    render(<MembersListPage />);

    expect(screen.getByTestId('members-table')).toBeInTheDocument();
    expect(screen.queryByTestId('members-card-list')).not.toBeInTheDocument();
  });

  it('exibe o título e a descrição da página', () => {
    mockUseIsMobile.mockReturnValue(false);

    render(<MembersListPage />);

    expect(screen.getByText('Gerenciar equipe')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Gerencie de forma centralizada os membros da sua equipe.'
      )
    ).toBeInTheDocument();
  });
});
