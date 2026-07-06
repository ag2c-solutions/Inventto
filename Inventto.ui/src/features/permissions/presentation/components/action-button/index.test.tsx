import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUsePermission = vi.fn();

vi.mock('../../hooks/use-permissions', () => ({
  usePermission: () => mockUsePermission()
}));

import { ActionButton } from '.';

describe('ActionButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePermission.mockReturnValue({
      can: vi.fn(() => true),
      isLoading: false
    });
  });

  it('deve renderizar o botão com o texto correto quando o usuário tem permissão', () => {
    render(<ActionButton action="product:view">Visualizar</ActionButton>);
    expect(
      screen.getByRole('button', { name: 'Visualizar' })
    ).toBeInTheDocument();
  });

  it('deve retornar null e não renderizar nada quando o usuário não tem permissão', () => {
    mockUsePermission.mockReturnValue({
      can: vi.fn(() => false),
      isLoading: false
    });
    render(<ActionButton action="product:create">Criar</ActionButton>);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('deve retornar null quando isLoading é true mesmo que can retorne true', () => {
    mockUsePermission.mockReturnValue({
      can: vi.fn(() => true),
      isLoading: true
    });
    render(<ActionButton action="product:view">Visualizar</ActionButton>);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('deve encaminhar props adicionais como className e onClick para o Button', () => {
    const handleClick = vi.fn();
    render(
      <ActionButton
        action="product:view"
        className="custom-class"
        onClick={handleClick}
      >
        Visualizar
      </ActionButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('deve encaminhar a ref corretamente para o elemento button do DOM', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <ActionButton ref={ref} action="product:view">
        Visualizar
      </ActionButton>
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
