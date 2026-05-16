import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUsePermission = vi.fn();

vi.mock('../../hooks/use-permissions', () => ({
  usePermission: () => mockUsePermission()
}));

import { ProtectedLink } from './index';

describe('ProtectedLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar null enquanto isLoading é true', () => {
    mockUsePermission.mockReturnValue({
      isLoading: true,
      can: vi.fn().mockReturnValue(true)
    });

    const { container } = render(
      <MemoryRouter>
        <ProtectedLink required="product:view" to="/products">
          Produtos
        </ProtectedLink>
      </MemoryRouter>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('deve renderizar null quando o usuário não tem permissão', () => {
    mockUsePermission.mockReturnValue({
      isLoading: false,
      can: vi.fn().mockReturnValue(false)
    });

    render(
      <MemoryRouter>
        <ProtectedLink required="product:view" to="/products">
          Produtos
        </ProtectedLink>
      </MemoryRouter>
    );

    expect(screen.queryByText('Produtos')).not.toBeInTheDocument();
  });

  it('deve renderizar o NavLink quando o usuário tem permissão', () => {
    mockUsePermission.mockReturnValue({
      isLoading: false,
      can: vi.fn().mockReturnValue(true)
    });

    render(
      <MemoryRouter>
        <ProtectedLink required="product:view" to="/products">
          Produtos
        </ProtectedLink>
      </MemoryRouter>
    );

    expect(screen.getByText('Produtos')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/products');
  });

  it('deve renderizar sempre quando required não é fornecido', () => {
    mockUsePermission.mockReturnValue({
      isLoading: false,
      can: vi.fn().mockReturnValue(false)
    });

    render(
      <MemoryRouter>
        <ProtectedLink to="/public">Link Público</ProtectedLink>
      </MemoryRouter>
    );

    expect(screen.getByText('Link Público')).toBeInTheDocument();
  });

  it('deve repassar props adicionais para o NavLink', () => {
    mockUsePermission.mockReturnValue({
      isLoading: false,
      can: vi.fn().mockReturnValue(true)
    });

    render(
      <MemoryRouter>
        <ProtectedLink
          required="product:view"
          to="/products"
          className="nav-link"
          data-testid="protected-link"
        >
          Produtos
        </ProtectedLink>
      </MemoryRouter>
    );

    const link = screen.getByTestId('protected-link');
    expect(link).toHaveAttribute('href', '/products');
    expect(link).toHaveClass('nav-link');
  });
});
