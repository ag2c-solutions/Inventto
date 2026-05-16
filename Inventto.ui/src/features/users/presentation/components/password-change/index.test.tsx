import { render, screen, waitFor } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useChangePassword } from './hook';
import { PasswordChange } from './index';

const { mockedUseUpdatePasswordMutation } = vi.hoisted(() => {
  return {
    mockedUseUpdatePasswordMutation: vi.fn()
  };
});

vi.mock('../../hooks/use-mutation', () => ({
  useUpdatePasswordMutation: mockedUseUpdatePasswordMutation
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

window.PointerEvent = MouseEvent as typeof PointerEvent;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();

describe('PasswordChange Feature', () => {
  const user = userEvent.setup();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockMutate.mockResolvedValue({});

    mockedUseUpdatePasswordMutation.mockReturnValue({
      mutateAsync: mockMutate,
      isPending: false,
      status: 'idle'
    });
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  const openDialog = async () => {
    await user.click(screen.getByRole('button', { name: /alterar senha/i }));
  };

  const getInputs = () => {
    const inputs = screen.getAllByPlaceholderText('••••••••');

    return {
      passwordInput: inputs[0],
      confirmInput: inputs[1]
    };
  };

  describe('Integration Tests (UI Flow)', () => {
    it('should render fields and buttons correctly', async () => {
      render(<PasswordChange />);

      await openDialog();

      expect(screen.getByText(/^Nova Senha$/i)).toBeInTheDocument();
      expect(screen.getByText(/Confirmar Nova Senha/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Atualizar Senha/i })
      ).toBeInTheDocument();
    });

    it('should toggle password visibility when clicking the icon', async () => {
      render(<PasswordChange />);

      await openDialog();

      const { passwordInput } = getInputs();
      const toggleBtn = screen.getAllByRole('button', {
        name: /mostrar senha/i
      })[0];

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(toggleBtn);

      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('should toggle confirm password visibility', async () => {
      render(<PasswordChange />);

      await openDialog();

      const { confirmInput } = getInputs();
      const toggleBtn = screen.getAllByRole('button', {
        name: /mostrar senha/i
      })[1];

      expect(confirmInput).toHaveAttribute('type', 'password');

      await user.click(toggleBtn);

      expect(confirmInput).toHaveAttribute('type', 'text');

      await user.click(toggleBtn);

      expect(confirmInput).toHaveAttribute('type', 'password');
    });

    it('should display validation errors when submitted empty', async () => {
      render(<PasswordChange />);

      await openDialog();

      await user.click(
        screen.getByRole('button', { name: /Atualizar Senha/i })
      );

      await waitFor(() => {
        expect(screen.getAllByText(/caracteres/i).length).toBeGreaterThan(0);
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('should display error when passwords do not match', async () => {
      render(<PasswordChange />);

      await openDialog();

      const { passwordInput, confirmInput } = getInputs();

      await user.type(passwordInput, 'Password123!');
      await user.type(confirmInput, 'Password123-Diferente');
      await user.click(
        screen.getByRole('button', { name: /Atualizar Senha/i })
      );

      await waitFor(() => {
        expect(
          screen.getByText(/as senhas não coincidem/i)
        ).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('should submit the form with valid data', async () => {
      render(<PasswordChange />);

      await openDialog();

      const { passwordInput, confirmInput } = getInputs();

      await user.type(passwordInput, 'StrongPass123!');
      await user.type(confirmInput, 'StrongPass123!');
      await user.click(
        screen.getByRole('button', { name: /Atualizar Senha/i })
      );

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith('StrongPass123!');
      });
    });

    it('should disable fields during submission (Loading)', async () => {
      mockedUseUpdatePasswordMutation.mockReturnValue({
        mutateAsync: mockMutate,
        isPending: true
      });

      render(<PasswordChange />);

      await openDialog();

      const { passwordInput } = getInputs();

      expect(passwordInput).toBeDisabled();
    });
  });

  describe('Unit Tests (Hook Logic)', () => {
    it('should call mutateAsync with the password on submit', async () => {
      const { result } = renderHook(() => useChangePassword());

      await act(async () => {
        await result.current.handleSubmit({
          password: 'ValidPass123!',
          confirmPassword: 'ValidPass123!'
        });
      });

      expect(mockMutate).toHaveBeenCalledWith('ValidPass123!');
    });
  });
});
