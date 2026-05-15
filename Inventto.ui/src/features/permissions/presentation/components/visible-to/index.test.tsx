import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUsePermission = vi.fn();

vi.mock('../../hooks/use-permissions', () => ({
  usePermission: () => mockUsePermission()
}));

import { VisibleTo } from './index';

describe('VisibleTo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePermission.mockReturnValue({
      can: vi.fn(() => true),
      isLoading: false
    });
  });

  it('não renderiza nada quando isLoading é true', () => {
    mockUsePermission.mockReturnValue({
      can: vi.fn(() => true),
      isLoading: true
    });
    const { container } = render(
      <VisibleTo action="product:view">
        <span>Conteúdo</span>
      </VisibleTo>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('não renderiza nada quando o usuário não tem permissão e fallback não é fornecido', () => {
    mockUsePermission.mockReturnValue({
      can: vi.fn(() => false),
      isLoading: false
    });
    const { container } = render(
      <VisibleTo action="product:delete">
        <span>Conteúdo</span>
      </VisibleTo>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza o fallback quando o usuário não tem permissão e fallback é fornecido', () => {
    mockUsePermission.mockReturnValue({
      can: vi.fn(() => false),
      isLoading: false
    });
    render(
      <VisibleTo action="product:delete" fallback={<span>Sem permissão</span>}>
        <span>Conteúdo</span>
      </VisibleTo>
    );
    expect(screen.getByText('Sem permissão')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo')).toBeNull();
  });

  it('renderiza os children quando o usuário tem permissão', () => {
    render(
      <VisibleTo action="product:view">
        <span>Conteúdo</span>
      </VisibleTo>
    );
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });
});
