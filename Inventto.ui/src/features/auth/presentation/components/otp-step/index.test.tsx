import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OtpStep } from './index';

// input-otp usa document.elementFromPoint que não existe no jsdom.
// Substituímos por um <input> simples que honra a mesma API de onChange(string).
vi.mock('@/shared/components/ui/input-otp', () => ({
  InputOTP: ({
    onChange,
    value,
    disabled,
    maxLength
  }: {
    onChange?: (val: string) => void;
    value?: string;
    disabled?: boolean;
    maxLength?: number;
    [key: string]: unknown;
  }) => (
    <input
      role="textbox"
      value={value ?? ''}
      maxLength={maxLength}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      // Filtra props do DOM que não pertencem a <input>
      data-testid="otp-input"
      readOnly={onChange === undefined}
    />
  ),
  InputOTPGroup: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  InputOTPSlot: () => null
}));

const defaultProps = {
  title: 'Verifique seu e-mail',
  sub: 'Enviamos um código para j•••@email.com.',
  ctaLabel: 'Ativar minha conta',
  onSubmit: vi.fn(),
  onResend: vi.fn()
};

describe('OtpStep', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) =>
    render(<OtpStep {...defaultProps} {...props} />);

  // ─── Renderização ────────────────────────────────────────────────────────────

  it('deve renderizar título, subtítulo e CTA', () => {
    renderComponent();

    expect(screen.getByText('Verifique seu e-mail')).toBeInTheDocument();
    expect(
      screen.getByText('Enviamos um código para j•••@email.com.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /ativar minha conta/i })
    ).toBeInTheDocument();
  });

  it('deve renderizar o botão de reenvio com label padrão', () => {
    renderComponent();

    expect(
      screen.getByRole('button', { name: /não recebeu\? reenviar código/i })
    ).toBeInTheDocument();
  });

  it('não deve exibir o botão "voltar" por padrão', () => {
    renderComponent();

    expect(
      screen.queryByRole('button', { name: /voltar/i })
    ).not.toBeInTheDocument();
  });

  it('deve exibir o botão "voltar" quando showBack=true', () => {
    renderComponent({ showBack: true });

    expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument();
  });

  it('deve exibir backLabel customizado quando fornecido', () => {
    renderComponent({ showBack: true, backLabel: 'Ir ao login' });

    expect(
      screen.getByRole('button', { name: /ir ao login/i })
    ).toBeInTheDocument();
  });

  // ─── Estado: empty / typing ──────────────────────────────────────────────────

  it('deve manter o CTA desabilitado enquanto o código está incompleto', async () => {
    renderComponent();

    const ctaBtn = screen.getByRole('button', { name: /ativar minha conta/i });
    expect(ctaBtn).toBeDisabled();

    const input = screen.getByRole('textbox');
    await user.type(input, '12345');

    expect(ctaBtn).toBeDisabled();
  });

  it('deve habilitar o CTA quando 6 dígitos são inseridos', async () => {
    renderComponent();

    const input = screen.getByRole('textbox');
    await user.type(input, '123456');

    expect(
      screen.getByRole('button', { name: /ativar minha conta/i })
    ).toBeEnabled();
  });

  it('deve chamar onSubmit com o código ao clicar no CTA', async () => {
    const onSubmit = vi.fn();
    renderComponent({ onSubmit });

    const input = screen.getByRole('textbox');
    await user.type(input, '123456');
    await user.click(
      screen.getByRole('button', { name: /ativar minha conta/i })
    );

    expect(onSubmit).toHaveBeenCalledWith('123456');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  // ─── Estado: error ───────────────────────────────────────────────────────────

  it('deve exibir a mensagem de erro quando errorMessage for fornecida', () => {
    renderComponent({
      errorMessage: 'Código inválido ou expirado. Tente novamente.'
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Código inválido ou expirado. Tente novamente.'
    );
  });

  it('não deve exibir mensagem de erro quando errorMessage é nula', () => {
    renderComponent({ errorMessage: null });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('deve manter o input editável no estado de erro', () => {
    renderComponent({
      errorMessage: 'Código inválido ou expirado. Tente novamente.'
    });

    expect(screen.getByRole('textbox')).not.toBeDisabled();
  });

  // ─── Estado: sending ─────────────────────────────────────────────────────────

  it('deve desabilitar o input e exibir "Verificando..." quando isSending=true', () => {
    renderComponent({ isSending: true });

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByText('Verificando...')).toBeInTheDocument();
  });

  it('deve desabilitar o botão de reenvio quando isSending=true', () => {
    renderComponent({ isSending: true });

    expect(
      screen.getByRole('button', { name: /não recebeu\? reenviar código/i })
    ).toBeDisabled();
  });

  // ─── Estado: cooldown ────────────────────────────────────────────────────────

  it('deve iniciar cooldown e desabilitar o botão de reenvio ao clicar em reenviar', async () => {
    const onResend = vi.fn();
    renderComponent({ onResend });

    const resendBtn = screen.getByRole('button', {
      name: /não recebeu\? reenviar código/i
    });

    await user.click(resendBtn);

    expect(onResend).toHaveBeenCalledTimes(1);
    expect(resendBtn).toBeDisabled();
    expect(resendBtn).toHaveTextContent(/reenviar código \(\d+s\)/i);
  });

  // ─── Botão voltar ────────────────────────────────────────────────────────────

  it('deve chamar onBack ao clicar no botão voltar', async () => {
    const onBack = vi.fn();
    renderComponent({ showBack: true, onBack });

    await user.click(screen.getByRole('button', { name: /voltar/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
