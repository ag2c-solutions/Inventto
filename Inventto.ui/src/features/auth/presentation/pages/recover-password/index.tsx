import { EmailStep } from '../../components/forms/recover-password/email-step';
import { PasswordStep } from '../../components/forms/recover-password/password-step';
import { OtpStep } from '../../components/otp-step';
import { maskEmail } from '../../utils/mask-email';

import { useRecoverPassword } from './use-recover-password';

export function RecoverPasswordPage() {
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
  } = useRecoverPassword();

  return (
    <div className="bg-background">
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
    </div>
  );
}
