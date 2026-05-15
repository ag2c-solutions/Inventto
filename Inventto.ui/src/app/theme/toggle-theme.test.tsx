import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ToggleTheme } from './toggle-theme';

const mocks = vi.hoisted(() => ({
  useTheme: vi.fn()
}));

vi.mock('next-themes', () => ({
  useTheme: mocks.useTheme
}));

describe('ToggleTheme', () => {
  it('deve renderizar um botão com o texto acessível "Alterar tema"', () => {
    mocks.useTheme.mockReturnValue({
      setTheme: vi.fn(),
      resolvedTheme: 'light'
    });

    render(<ToggleTheme />);

    expect(screen.getByText('Alterar tema')).toBeInTheDocument();
  });

  it('deve chamar setTheme("dark") quando o tema atual é "light"', async () => {
    const setTheme = vi.fn();
    mocks.useTheme.mockReturnValue({ setTheme, resolvedTheme: 'light' });

    const user = userEvent.setup();
    render(<ToggleTheme />);

    await user.click(screen.getByRole('button'));

    expect(setTheme).toHaveBeenCalledOnce();
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('deve chamar setTheme("light") quando o tema atual é "dark"', async () => {
    const setTheme = vi.fn();
    mocks.useTheme.mockReturnValue({ setTheme, resolvedTheme: 'dark' });

    const user = userEvent.setup();
    render(<ToggleTheme />);

    await user.click(screen.getByRole('button'));

    expect(setTheme).toHaveBeenCalledOnce();
    expect(setTheme).toHaveBeenCalledWith('light');
  });
});
