import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { navGroups } from '../../constants/navlinks-sidebar';

import { NavItens } from './nav-itens';

const mocks = vi.hoisted(() => ({
  usePermission: vi.fn()
}));

vi.mock('@/features/permissions', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    usePermission: mocks.usePermission
  };
});

vi.mock('@/features/permissions/presentation/hooks/use-permissions', () => ({
  usePermission: mocks.usePermission
}));

vi.mock('@/shared/components/ui/sidebar', () => ({
  SidebarGroup: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroupLabel: ({ children }: { children: ReactNode }) => (
    <div data-testid="group-label">{children}</div>
  ),
  SidebarMenu: ({ children }: { children: ReactNode }) => <ul>{children}</ul>,
  SidebarMenuItem: ({ children }: { children: ReactNode }) => (
    <li>{children}</li>
  ),
  SidebarMenuButton: ({
    children,
    isActive,
    'aria-current': ariaCurrent
  }: {
    children: ReactNode;
    isActive?: boolean;
    'aria-current'?: React.AriaAttributes['aria-current'];
  }) => (
    <div data-active={isActive} aria-current={ariaCurrent}>
      {children}
    </div>
  )
}));

// Helper: flattens all enabled items across all groups
const allEnabledItems = navGroups.flatMap(({ items }) =>
  items.filter(({ enabled }) => enabled !== false)
);

describe('NavItens', () => {
  it('deve renderizar todos os links habilitados quando o usuário tem todas as permissões', () => {
    mocks.usePermission.mockReturnValue({
      can: vi.fn().mockReturnValue(true),
      isLoading: false
    });

    render(
      <MemoryRouter>
        <NavItens />
      </MemoryRouter>
    );

    for (const item of allEnabledItems) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it('deve renderizar apenas os links para os quais o usuário tem permissão', () => {
    mocks.usePermission.mockReturnValue({
      can: vi.fn((action) => action === 'product:view'),
      isLoading: false
    });

    render(
      <MemoryRouter>
        <NavItens />
      </MemoryRouter>
    );

    expect(screen.getByText('Produtos')).toBeInTheDocument();

    // Itens sem permission sempre aparecem quando enabled — apenas verifica
    // os que têm uma permission que o usuário não possui
    const outrosLinks = allEnabledItems.filter(
      ({ label, permission }) => label !== 'Produtos' && !!permission
    );
    for (const item of outrosLinks) {
      expect(screen.queryByText(item.label)).not.toBeInTheDocument();
    }
  });

  it('não deve renderizar itens com enabled=false mesmo com todas as permissões', () => {
    mocks.usePermission.mockReturnValue({
      can: vi.fn().mockReturnValue(true),
      isLoading: false
    });

    render(
      <MemoryRouter>
        <NavItens />
      </MemoryRouter>
    );

    const disabledItems = navGroups.flatMap(({ items }) =>
      items.filter(({ enabled }) => enabled === false)
    );

    for (const item of disabledItems) {
      expect(screen.queryByText(item.label)).not.toBeInTheDocument();
    }
  });

  it('deve não renderizar um grupo quando nenhum item é visível', () => {
    // Only product:view → ADMINISTRAÇÃO group has no visible items
    mocks.usePermission.mockReturnValue({
      can: vi.fn((action) => action === 'product:view'),
      isLoading: false
    });

    render(
      <MemoryRouter>
        <NavItens />
      </MemoryRouter>
    );

    expect(screen.queryByText('ADMINISTRAÇÃO')).not.toBeInTheDocument();
  });

  it('deve renderizar os rótulos dos grupos visíveis', () => {
    mocks.usePermission.mockReturnValue({
      can: vi.fn().mockReturnValue(true),
      isLoading: false
    });

    render(
      <MemoryRouter>
        <NavItens />
      </MemoryRouter>
    );

    // Only groups that have at least one enabled item should be rendered
    const groupsWithEnabledItems = navGroups.filter(({ items }) =>
      items.some(({ enabled }) => enabled !== false)
    );

    for (const { group } of groupsWithEnabledItems) {
      expect(screen.getByText(group)).toBeInTheDocument();
    }
  });

  it('deve aplicar data-active=true ao link da rota atual', () => {
    mocks.usePermission.mockReturnValue({
      can: vi.fn().mockReturnValue(true),
      isLoading: false
    });

    render(
      <MemoryRouter initialEntries={['/products']}>
        <NavItens />
      </MemoryRouter>
    );

    const produtosWrapper = screen
      .getByText('Produtos')
      .closest('[data-active]');
    expect(produtosWrapper).toHaveAttribute('data-active', 'true');
  });

  it('deve renderizar os links como elementos <a> com o href correto', () => {
    mocks.usePermission.mockReturnValue({
      can: vi.fn().mockReturnValue(true),
      isLoading: false
    });

    render(
      <MemoryRouter>
        <NavItens />
      </MemoryRouter>
    );

    for (const item of allEnabledItems) {
      const anchor = screen.getByRole('link', {
        name: new RegExp(item.label, 'i')
      });
      expect(anchor).toHaveAttribute('href', item.href);
    }
  });

  it('deve retornar null enquanto as permissões estão carregando', () => {
    mocks.usePermission.mockReturnValue({ can: vi.fn(), isLoading: true });

    const { container } = render(
      <MemoryRouter>
        <NavItens />
      </MemoryRouter>
    );

    expect(container).toBeEmptyDOMElement();
  });
});
