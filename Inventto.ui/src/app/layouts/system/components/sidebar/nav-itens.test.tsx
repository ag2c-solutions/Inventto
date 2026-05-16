import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { navLinks } from '../../constants/navlinks-sidebar';

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
  SidebarMenuButton: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  )
}));

describe('NavItens', () => {
  it('deve renderizar todos os links quando o usuário tem todas as permissões', () => {
    mocks.usePermission.mockReturnValue({ can: vi.fn().mockReturnValue(true) });

    render(
      <MemoryRouter>
        <NavItens />
      </MemoryRouter>
    );

    for (const link of navLinks) {
      expect(screen.getByText(link.label)).toBeInTheDocument();
    }
  });

  it('deve renderizar apenas os links para os quais o usuário tem permissão', () => {
    mocks.usePermission.mockReturnValue({
      can: vi.fn((action) => action === 'product:view')
    });

    render(
      <MemoryRouter>
        <NavItens />
      </MemoryRouter>
    );

    expect(screen.getByText('Produtos')).toBeInTheDocument();

    const outrosLinks = navLinks.filter(({ label }) => label !== 'Produtos');
    for (const link of outrosLinks) {
      expect(screen.queryByText(link.label)).not.toBeInTheDocument();
    }
  });

  it('deve aplicar a classe bg-primary ao link ativo', () => {
    mocks.usePermission.mockReturnValue({ can: vi.fn().mockReturnValue(true) });

    render(
      <MemoryRouter initialEntries={['/products']}>
        <NavItens />
      </MemoryRouter>
    );

    const activeLink = screen.getByRole('link', { name: /produtos/i });
    expect(activeLink).toHaveClass('bg-primary');
  });

  it('deve não aplicar a classe bg-primary aos links inativos', () => {
    mocks.usePermission.mockReturnValue({ can: vi.fn().mockReturnValue(true) });

    render(
      <MemoryRouter initialEntries={['/products']}>
        <NavItens />
      </MemoryRouter>
    );

    const inactiveLinks = navLinks
      .filter(({ href }) => href !== '/products')
      .map(({ label }) =>
        screen.getByRole('link', { name: new RegExp(label, 'i') })
      );

    for (const link of inactiveLinks) {
      expect(link).not.toHaveClass('bg-primary');
    }
  });

  it('deve renderizar os links como elementos <a> com o href correto', () => {
    mocks.usePermission.mockReturnValue({ can: vi.fn().mockReturnValue(true) });

    render(
      <MemoryRouter>
        <NavItens />
      </MemoryRouter>
    );

    for (const link of navLinks) {
      const anchor = screen.getByRole('link', {
        name: new RegExp(link.label, 'i')
      });
      expect(anchor).toHaveAttribute('href', link.href);
    }
  });
});
