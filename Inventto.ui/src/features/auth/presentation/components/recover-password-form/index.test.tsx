import { MemoryRouter } from 'react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RecoverPasswordForm } from './index';

const mockRecoverPassword = vi.fn();

vi.mock('../../hooks/use-mutations', () => ({
  useRecoverPasswordMutation: () => ({ mutateAsync: mockRecoverPassword })
}));

vi.mock('@/app/brand/logo', () => ({
  Logo: () => <div data-testid="mock-logo">Logo</div>
}));

const NEUTRAL_FEEDBACK =
  'Se houver uma conta associada a este endereço de e-mail, as instruções de redefinição foram enviadas.';

function renderForm() {
  return render(
    <MemoryRouter>
      <RecoverPasswordForm />
    </MemoryRouter>
  );
}

describe('RecoverPasswordForm Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form with title, email field and back link', () => {
    renderForm();

    expect(
      screen.getByRole('heading', { name: 'Recuperar senha' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail cadastrado')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Enviar instruções de redefinição' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Voltar para o Login' })
    ).toHaveAttribute('href', '/auth/login');
  });

  it('should show validation error and not submit with empty email', async () => {
    renderForm();

    await user.click(
      screen.getByRole('button', { name: 'Enviar instruções de redefinição' })
    );

    await waitFor(() => {
      expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument();
    });
    expect(mockRecoverPassword).not.toHaveBeenCalled();
  });

  it('should show the neutral sent feedback after successful submit', async () => {
    mockRecoverPassword.mockResolvedValue(undefined);

    renderForm();

    await user.type(
      screen.getByLabelText('E-mail cadastrado'),
      'joana@email.com'
    );
    await user.click(
      screen.getByRole('button', { name: 'Enviar instruções de redefinição' })
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Verifique seu e-mail' })
      ).toBeInTheDocument();
    });

    expect(mockRecoverPassword).toHaveBeenCalledWith({
      email: 'joana@email.com'
    });
    expect(screen.getByText(NEUTRAL_FEEDBACK)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Voltar para o Login' })
    ).toHaveAttribute('href', '/auth/login');
  });

  it('should show the same neutral feedback when the request fails (RN002)', async () => {
    mockRecoverPassword.mockRejectedValue(new Error('User not found'));

    renderForm();

    await user.type(
      screen.getByLabelText('E-mail cadastrado'),
      'naoexiste@email.com'
    );
    await user.click(
      screen.getByRole('button', { name: 'Enviar instruções de redefinição' })
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Verifique seu e-mail' })
      ).toBeInTheDocument();
    });

    expect(screen.getByText(NEUTRAL_FEEDBACK)).toBeInTheDocument();
    expect(screen.queryByText('User not found')).not.toBeInTheDocument();
  });
});
