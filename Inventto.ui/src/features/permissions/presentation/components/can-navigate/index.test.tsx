import { MemoryRouter, Route, Routes } from 'react-router';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUsePermission = vi.fn();

vi.mock('../../hooks/use-permissions', () => ({
  usePermission: () => mockUsePermission()
}));

import { CanNavigate } from './index';

describe('CanNavigate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar null enquanto isLoading é true', () => {
    mockUsePermission.mockReturnValue({
      isLoading: true,
      can: vi.fn().mockReturnValue(true)
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/protegida']}>
        <Routes>
          <Route element={<CanNavigate required="product:view" />}>
            <Route path="/protegida" element={<div>Conteúdo protegido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('deve redirecionar para fallbackPath quando o usuário não tem permissão', () => {
    mockUsePermission.mockReturnValue({
      isLoading: false,
      can: vi.fn().mockReturnValue(false)
    });

    render(
      <MemoryRouter initialEntries={['/protegida']}>
        <Routes>
          <Route
            element={
              <CanNavigate required="product:view" fallbackPath="/sem-acesso" />
            }
          >
            <Route path="/protegida" element={<div>Conteúdo protegido</div>} />
          </Route>
          <Route path="/sem-acesso" element={<div>Sem acesso</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Sem acesso')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument();
  });

  it('deve redirecionar para "/" por padrão quando fallbackPath não é fornecido', () => {
    mockUsePermission.mockReturnValue({
      isLoading: false,
      can: vi.fn().mockReturnValue(false)
    });

    render(
      <MemoryRouter initialEntries={['/protegida']}>
        <Routes>
          <Route element={<CanNavigate required="product:view" />}>
            <Route path="/protegida" element={<div>Conteúdo protegido</div>} />
          </Route>
          <Route path="/" element={<div>Página inicial</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Página inicial')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument();
  });

  it('deve renderizar o Outlet quando o usuário tem permissão', () => {
    mockUsePermission.mockReturnValue({
      isLoading: false,
      can: vi.fn().mockReturnValue(true)
    });

    render(
      <MemoryRouter initialEntries={['/protegida']}>
        <Routes>
          <Route element={<CanNavigate required="product:view" />}>
            <Route path="/protegida" element={<div>Conteúdo protegido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument();
  });

  // ORG-01 — a rota /settings exige org:manage (Owner only, RN020).
  it('deve bloquear /settings (org:manage) para quem não tem permissão', () => {
    mockUsePermission.mockReturnValue({
      isLoading: false,
      can: vi.fn().mockReturnValue(false)
    });

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route element={<CanNavigate required="org:manage" />}>
            <Route path="/settings" element={<div>Configurações</div>} />
          </Route>
          <Route path="/" element={<div>Página inicial</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Página inicial')).toBeInTheDocument();
    expect(screen.queryByText('Configurações')).not.toBeInTheDocument();
  });

  it('deve permitir /settings (org:manage) para o Owner', () => {
    mockUsePermission.mockReturnValue({
      isLoading: false,
      can: vi.fn().mockReturnValue(true)
    });

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route element={<CanNavigate required="org:manage" />}>
            <Route path="/settings" element={<div>Configurações</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Configurações')).toBeInTheDocument();
  });
});
