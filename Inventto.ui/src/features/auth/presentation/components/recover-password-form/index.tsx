import { maskEmail } from '../../utils/mask-email';
import { OtpStep } from '../otp-step';

import { useRecoverPasswordForm } from './hooks/use-recover-password-form';
import { EmailStep } from './pieces/email-step';
import { PasswordStep } from './pieces/password-step';

export function RecoverPasswordForm() {
  const {
    step,
    email,
    emailForm,
    passwordForm,
    isVerifying,
    otpError,
    onSubmitEmail,
    onSubmitOtp,
    onResendOtp,
    onBackToEmail,
    onSubmitPassword
  } = useRecoverPasswordForm();

  return (
    <>
      {step === 'email' && (
        <EmailStep form={emailForm} onSubmit={onSubmitEmail} />
      )}

      {step === 'otp' && (
        <OtpStep
          title="Digite o código"
          sub={`Enviamos um código de 6 dígitos para ${maskEmail(email)}. Digite-o abaixo para redefinir sua senha.`}
          ctaLabel="Confirmar código"
          showBack
          backLabel="Voltar para o e-mail"
          isSending={isVerifying}
          errorMessage={otpError}
          onSubmit={onSubmitOtp}
          onResend={onResendOtp}
          onBack={onBackToEmail}
        />
      )}

      {step === 'password' && (
        <PasswordStep form={passwordForm} onSubmit={onSubmitPassword} />
      )}
    </>
  );
}
