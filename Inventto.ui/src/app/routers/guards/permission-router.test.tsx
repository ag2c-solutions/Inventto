import { MemoryRouter, Route, Routes } from 'react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PermissionRoute } from './permission-router';

const mocks = vi.hoisted(() => ({
  usePermission: vi.fn()
}));

vi.mock('@/features/permissions', () => ({
  usePermission: mocks.usePermission
}));

describe('PermissionRoute', () => {
  it('deve renderizar null enquanto isLoading é true', () => {
    mocks.usePermission.mockReturnValue({
      isLoading: true,
      can: vi.fn().mockReturnValue(true)
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/protegida']}>
        <Routes>
          <Route element={<PermissionRoute required="product:view" />}>
            <Route path="/protegida" element={<div>Conteúdo protegido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument();
  });

  it('deve redirecionar para "/" quando o usuário não tem permissão', () => {
    mocks.usePermission.mockReturnValue({
      isLoading: false,
      can: vi.fn().mockReturnValue(false)
    });

    render(
      <MemoryRouter initialEntries={['/protegida']}>
        <Routes>
          <Route element={<PermissionRoute required="product:view" />}>
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
    mocks.usePermission.mockReturnValue({
      isLoading: false,
      can: vi.fn().mockReturnValue(true)
    });

    render(
      <MemoryRouter initialEntries={['/protegida']}>
        <Routes>
          <Route element={<PermissionRoute required="product:view" />}>
            <Route path="/protegida" element={<div>Conteúdo protegido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument();
  });
});
